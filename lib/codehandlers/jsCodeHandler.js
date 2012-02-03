exports.methodSignature = function (methodSignatureLine) {
    var match = methodSignatureLine.match("[^{]*");
    return match ? match[0].trim() : null;
};

exports.methodNameFromMethodSignature = function(methodSignature) {
    var methodName = null;
    if (methodSignature.indexOf("function") != -1) {
        if (methodSignature.indexOf("=") !== -1) {
            if (methodSignature.trim().indexOf("exports.") === 0) {
                methodName = methodSignature.substring(methodSignature.indexOf("exports.") + 8, methodSignature.indexOf("="));
            } else if (methodSignature.trim().indexOf("var") === 0) {
                methodName = methodSignature.substring(methodSignature.indexOf("var") + 4, methodSignature.indexOf("="));
            }
        } else {
            methodName = methodSignature.substring(methodSignature.indexOf("function") + 8, methodSignature.indexOf("("));
        }

    }

    return methodName && methodName.length > 0 ? methodName.trim() : null;
};

exports.variableNameFromVariableDecl = function(variableDecl) {
    return variableDecl.trim().substr(3).trim().split(" ")[0];
};

exports.isVariableDecl = function (line) {
    return line.indexOf("function") === -1 && line.trim().indexOf("var") === 0;
};

exports.isMethodDecl = function (line) {
    return line.match("function[\\s\\w]*\\([\\w,\\s]*\\)") !== null; // not perfect but hopefully adequate
};

