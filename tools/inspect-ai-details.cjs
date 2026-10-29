const fs=require('fs'),s=fs.readFileSync('paddleup-offline/site/_next/static/chunks/0axfra5kwz6z1.js','utf8');
for(const [start,end]of [[835000,837600],[839000,849500],[128000,134000]])console.log('\nRANGE '+start+'\n'+s.slice(start,end).replaceAll(';',';\n'));
