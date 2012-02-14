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
    var match = variableDecl.trim().match("[\\s]+[a-zA-Z_[\\w]*|\\.[a-zA-Z_][\\w]*");
    var varName = null;
    if (match) {
        varName = match[0].trim();
        varName = varName.indexOf(".") === 0 ? varName.substr(1) : varName;
    }
    return varName;
};

exports.isVariableDecl = function (line) {
    var match = line.trim().match("[a-zA-Z_][\\w]*\\.[a-zA-Z_][\\w]*[\\s]*=|var[\\s]+[a-zA-Z_][\\w]*");
    return line.indexOf("function") === -1 && match && match.index === 0;
};

exports.isMethodDecl = function (line) {
    return line.match("function[\\s\\w]*\\([\\w,\\s]*\\)") !== null; // not perfect but hopefully adequate
};



