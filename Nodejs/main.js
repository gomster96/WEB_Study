var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template");
var path = require("path");
var sanitzeHtml = require("sanitize-html");
const sanitizeHtml = require("sanitize-html");
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
                var list = template.list(filelist);
                var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a> `);
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir("./data", (err, filelist) => {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
                    if (err) throw err;
                    var title = queryData.id;
                    var sanitizedTitle = sanitzeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description);
                    var list = template.list(filelist);
                    var html = template.html(
                        sanitizedTitle,
                        list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a> 
                    <a href="/update?id=${sanitizedTitle}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>
                    `
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
        // 페이지가 열릴때마다 HTML 파일을 읽어서 사용하기 때문에 해결이가능하다
    } else if (pathname === "/create") {
        fs.readdir("./data", (err, filelist) => {
            if (err) throw err;
            var title = "WEB - create";
            var list = template.list(filelist);
            var html = template.html(
                title,
                list,
                `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p> 
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
                </form>
                `,
                ""
            );
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === "/create_process") {
        var body = "";
        // 웹브라우저가 호스트에 data를 전송할 때, 한번에 보내면 문제가 발생할 수 있으므로
        // 호스트 방식으로 오는 데이터가 많을경우, Nodejs는 그 해당 데이터들을 조각조각 수신할 때 마다 이 콜백함수를 호출하도록 만든 함수이다
        // 즉 여기서 DATA는 부분적으로 DATa가 오기때문에 body = body+data; 를 사용하여 data를 합쳐준다
        request.on("data", (data) => {
            body = body + data;
        });
        request.on("end", () => {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, "utf8", (err) => {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            });
        });
    } else if (pathname === "/update") {
        fs.readdir("./data", (err, filelist) => {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
                if (err) throw err;
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(
                    title,
                    list,
                    `<form action="/update_process" method="post">
                    <input type="text" name="id" value="${title}" hidden>
                    <p><input type="text" name="title" placeholder="title" value=${title}></p> 
                    <p><textarea name="description" placeholder="description">${description}</textarea></p>
                    <p><input type="submit"></p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === "/update_process") {
        var body = "";
        request.on("data", (data) => {
            body = body + data;
        });
        request.on("end", () => {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            // 파일 이름 수정
            fs.rename(`data/${id}`, `data/${title}`, (error) => {});
            // 파일 내용 수정
            // 파일 내용을 바꾼 뒤 다시 redirect
            fs.writeFile(`data/${title}`, description, "utf8", (err) => {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            });
        });
    } else if (pathname === "/delete_process") {
        var body = "";
        request.on("data", (data) => {
            body = body + data;
        });
        request.on("end", () => {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, (err) => {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
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
