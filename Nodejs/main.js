var http = require("http");
var fs = require("fs");
var url = require("url");

function templateHTML(title, list, body) {
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
        ${body}
    </body>
    </html>
    `;
}

function templateList(filelist) {
    var list = "<ul>";
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i++;
    }
    list = list + "</ul>";
    return list;
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === "/") {
        if (queryData.id === undefined) {
            fs.readdir("./data", (err, filelist) => {
                if (err) throw err;
                var title = "Welcome";
                var description = "Hello, Node.js";
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readFile(`data/${queryData.id}`, "utf8", (err, description) => {
                fs.readdir("./data", (err, filelist) => {
                    if (err) throw err;
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
        // 페이지가 열릴때마다 HTML 파일을 읽어서 사용하기 때문에 해결이가능하다
    } else {
        // 200 일 시에 성공적으로 한것
        // 404 이면 무엇인가가 잘 못된것
        response.writeHead(404);
        response.end("Not found");
    }

    //   response.end(fs.readFileSync(__dirname + _url));
    //   이렇게 할시에 byungwoongan : index.html 이 결과값이 나옴
    // 즉 Response.end 는 사용자에게 전송할 데이터를 보내주는것이다.
    //   response.end("byungwoongan: " + url);

    // 이렇게 "/"이면 /index.html 로 바꿔줄 수 있음
    // if (_url == "/") {
    //     // _url = "/index.html";
    //     title = "Welcome";
    // }
    // if (_url == "/favicon.ico") {
    //     return response.writeHead(404);
    // }
    //   console.log(__dirname + _url);
    // 이렇게 경로에도 추가해줄 수 있음
});
// 이 LIsten은 localhost 의 Port 번호를 뜻함
app.listen(3000);
