import importHTML from "./esm/index";

const request = url =>
  fetch(url, {
    header: {
      "Access-Control-Allow-Origin": "*"
    }
	});

importHTML("//localhost:8081", {
  fetch: request
}).then(res => {
  // console.log(res)
  res.execScripts().then(exports => {
    // console.log(exports);
  });
});
