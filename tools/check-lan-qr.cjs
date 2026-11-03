const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={};ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('site/lan-protocol.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('site/lan-qr.js','utf8'),ctx);
const Q=ctx.RallyLanQR,info={addresses:['192.168.43.1','10.0.0.2'],port:9438,code:'001234'};
assert.deepEqual(JSON.parse(JSON.stringify(Q.parse(Q.payload(info,'10.0.0.2')))),{address:'10.0.0.2:9438',code:'001234'});
for(const s of ['https://example.com','{}','rally-lan:bad',Q.payload(info).replace('lan-1','lan-99'),Q.payload(info).replace('192.168.43.1','8.8.8.8'),Q.payload(info).replace('001234','abc')])assert.throws(()=>Q.parse(s));
vm.runInContext(fs.readFileSync('site/vendor/qrcode.js','utf8'),ctx);vm.runInContext(fs.readFileSync('site/vendor/jsQR.js','utf8'),ctx);
const text=Q.payload(info),qr=ctx.qrcode(0,'M');qr.addData(text);qr.make();const size=(qr.getModuleCount()+8)*5,pixels=new Uint8ClampedArray(size*size*4);pixels.fill(255);for(let y=0;y<qr.getModuleCount();y++)for(let x=0;x<qr.getModuleCount();x++)if(qr.isDark(y,x))for(let yy=0;yy<5;yy++)for(let xx=0;xx<5;xx++){const i=(((y+4)*5+yy)*size+(x+4)*5+xx)*4;pixels[i]=pixels[i+1]=pixels[i+2]=0;}
assert.equal(ctx.jsQR(pixels,size,size).data,text);console.log('PASS private/versioned QR payload validation and real QR roundtrip');
