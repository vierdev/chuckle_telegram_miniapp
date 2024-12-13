import fs from "node:fs";
import path from "node:path";

const pagesDir = path.resolve(__dirname, "../pages");
const outputFilePath = path.resolve(__dirname, "../autoGeneratedRoutes.jsx");

const getRoutePath = (filePath) => {
	let relativePath = path.relative(pagesDir, filePath).replace(/\\/g, "/");
	relativePath = relativePath.replace(/\.(jsx|tsx)$/, "");

	if (relativePath === "index") return "/";
	if (relativePath.endsWith("/index")) {
		relativePath = relativePath.replace(/\/index$/, "");
	}

	relativePath = relativePath.replace(/\[([^\]]+)\]/g, ":$1");

	return `/${relativePath}`;
};

const getComponentName = (filePath) => {
	const relativePath = path.relative(pagesDir, filePath).replace(/\\/g, "/");
	const nameParts = relativePath
		.replace(/\.(jsx|tsx)$/, "")
		.split("/")
		.map((part) => {
			if (part.startsWith("[") && part.endsWith("]")) {
				return part.slice(1, -1).replace(/[^a-zA-Z0-9]/g, "");
			}
			return part.charAt(0).toUpperCase() + part.slice(1);
		});
	return nameParts.join("");
};

const walkDir = (dir, imports) => {
	const files = fs.readdirSync(dir);
	let routes = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			routes = routes.concat(walkDir(filePath, imports));
		} else if (
			/\.(jsx|tsx)$/.test(file) &&
			file !== "loading.jsx" &&
			file !== "error.jsx"
		) {
			const routePath = getRoutePath(filePath);
			const componentName = getComponentName(filePath);
			const importPath = `./pages/${path.relative(pagesDir, filePath).replace(/\\/g, "/")}`;

			const loadingFilePath = path.join(path.dirname(filePath), "loading.jsx");

			if (componentName === "Notfound") {
				imports.add(
					`const ${componentName} = React.lazy(() => import('${importPath}'));`,
				);
				routes.push({
					path: routePath,
					componentName,
					loader: `<${componentName} />`,
				});
			} else if (componentName === "Index") {
				// Adicionando atraso ao Index
				imports.add(`const delayedImport = (importFunc, delay = 4000) => {
					return new Promise(resolve => {
						setTimeout(() => resolve(importFunc()), delay);
					});
				};`);
				imports.add(
					`const ${componentName} = React.lazy(() => delayedImport(() => import('${importPath}')));`,
				);

				if (fs.existsSync(loadingFilePath)) {
					const loaderComponentName = `${componentName}Loader`;
					imports.add(
						`import ${loaderComponentName} from '${loadingFilePath
							.replace(pagesDir, "./pages")
							.replace(/\\/g, "/")}';`,
					);
					routes.push({
						path: routePath,
						componentName,
						loader: `<Suspense fallback={<${loaderComponentName} />}><${componentName} /></Suspense>`,
					});
				} else {
					routes.push({
						path: routePath,
						componentName,
						loader: `<${componentName} />`,
					});
				}
			} else {
				imports.add(
					`const ${componentName} = React.lazy(() => import('${importPath}'));`,
				);

				if (fs.existsSync(loadingFilePath)) {
					const loaderComponentName = `${componentName}Loader`;
					imports.add(
						`import ${loaderComponentName} from '${loadingFilePath
							.replace(pagesDir, "./pages")
							.replace(/\\/g, "/")}';`,
					);
					routes.push({
						path: routePath,
						componentName,
						loader: `<Suspense fallback={<${loaderComponentName} />}><${componentName} /></Suspense>`,
					});
				} else {
					routes.push({
						path: routePath,
						componentName,
						loader: `<${componentName} />`,
					});
				}
			}
		}
	}

	return routes;
};

const generateRoutes = () => {
	const imports = new Set();
	const routes = walkDir(pagesDir, imports);

	const routesJsx = routes
		.map(
			({ path, loader }) =>
				`\t\t\t<Route path="${path}" element={${loader}} />`,
		)
		.join("\n");

	const content = `
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

${Array.from(imports).join("\n")}

const AppRoutes = () => (
\t<Router>
\t\t<Routes>
${routesJsx}
\t\t\t<Route path="*" element={<Notfound />} />
\t\t</Routes>
\t</Router>
);

export default AppRoutes;
`;

	fs.writeFileSync(outputFilePath, content.trim(), "utf-8");
	console.log("🚧 Routes generated successfully! 🎉");
};

generateRoutes();
