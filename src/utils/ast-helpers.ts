import { readFileSync } from "fs";
import ts from "typescript";

type ResultType = {
  type: "CodePart" | "partFromSimpleFunction";
  id: string;
  run: string;
};

// Function to process object literal expression and return id and run
export function processObjectLiteralExpression(
  node: ts.ObjectLiteralExpression
): { id: string; run: string } | undefined {
  let id: string | undefined;
  let run: string | undefined;

  node.properties.forEach((prop) => {
    if (ts.isPropertyAssignment(prop)) {
      if (prop.name.getText() === "id") {
        id = JSON.parse(prop.initializer.getText());
      }
      if (prop.name.getText() === "run") {
        run = prop.initializer.getText();
      }
    }
  });

  if (id && run) {
    return { id, run };
  } else {
    return undefined;
  }
}

// Function to walk the AST and gather information about exported consts
export function extractRawFunctionCode(node: ts.Node): ResultType[] {
  let results: ResultType[] = [];

  if (ts.isVariableStatement(node)) {
    const declarationList = node.declarationList;

    declarationList.declarations.forEach((declaration) => {
      if (ts.isVariableDeclaration(declaration)) {
        const initializer = declaration.initializer;

        if (
          declaration.type &&
          ts.isTypeReferenceNode(declaration.type) &&
          declaration.type.typeName.getText() === "CodePart"
        ) {
          if (initializer && ts.isObjectLiteralExpression(initializer)) {
            const part = processObjectLiteralExpression(initializer);
            if (part) {
              results.push({ type: "CodePart", ...part });
            }
          }
        } else if (
          initializer &&
          ts.isCallExpression(initializer) &&
          ts.isIdentifier(initializer.expression) &&
          initializer.expression.escapedText === "partFromSimpleFunction"
        ) {
          initializer.arguments.forEach((arg) => {
            if (ts.isObjectLiteralExpression(arg)) {
              const part = processObjectLiteralExpression(arg);
              if (part) {
                results.push({ type: "partFromSimpleFunction", ...part });
              }
            }
          });
        }
      }
    });
  }

  ts.forEachChild(node, (child) => {
    results = results.concat(extractRawFunctionCode(child));
  });

  return results;
}

export function fileToTypescriptAst(file: string) {
  const source = readFileSync(file, "utf8");
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    /*setParentNodes */ true
  );
  return ast;
}

export function getFunctionDetails(func: string): {
  params: string[];
  body: string;
} {
  // Create a SourceFile object from the function string
  let sourceFile = ts.createSourceFile(
    "temp.ts",
    func,
    ts.ScriptTarget.ES2015,
    true
  );

  let parameters: string[] = [];
  let body: string = "";

  // Walk the AST and get the function parameters and body
  function walk(node: ts.Node) {
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      node.parameters.forEach((param) => {
        parameters.push(param.name.getText());
      });

      // Check if the body is a block (has curly braces {})
      if (ts.isBlock(node.body)) {
        // Get the text within the curly braces {}
        body = node.body.getText(sourceFile).slice(1, -1).trim();
      } else {
        // If the body isn't a block, it's an expression, so just get its text
        body = "return " + node.body.getText(sourceFile) + ";";
      }
    } else {
      ts.forEachChild(node, walk);
    }
  }

  walk(sourceFile);

  return { params: parameters, body: body };
}
