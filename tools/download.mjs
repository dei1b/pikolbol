import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../site');
const urls = [
  "https://paddleup.ph/",
  "https://paddleup.ph/_next/static/media/0595f7052377a1a2-s.p.2lpos000q_nzo.woff2",
  "https://paddleup.ph/_next/static/media/303804218d80822e-s.p.3lj349bs9hfu1.woff2",
  "https://paddleup.ph/_next/static/media/49d07f3cdebee475-s.p.2ux8js4lqnjxb.woff2",
  "https://paddleup.ph/_next/static/media/6c98c9fb873995d2-s.p.22ggkaf3lyu8c.woff2",
  "https://paddleup.ph/_next/static/media/7c153c022564ac00-s.p.161_jydx6c0ui.woff2",
  "https://paddleup.ph/_next/static/media/89232e6535d3b87e-s.p.2oeto2j5aaelm.woff2",
  "https://paddleup.ph/_next/static/media/966258b9232ba178-s.p.02d3pf396kpkp.woff2",
  "https://paddleup.ph/_next/static/media/a083361d37caf3d1-s.p.0s4utfvp8prsy.woff2",
  "https://paddleup.ph/_next/static/media/c6e2684784a55443-s.p.2p4adm_386h58.woff2",
  "https://paddleup.ph/_next/static/media/d9b5d46d9a89ffe6-s.p.0xxdg0o7uh536.woff2",
  "https://paddleup.ph/_next/static/media/efe66f9dab7e6ce7-s.p.1hhkevm56nbhg.woff2",
  "https://paddleup.ph/_next/static/media/material_symbols_rounded-s.p.1e98hksytv-k8.woff2",
  "https://paddleup.ph/_next/static/chunks/1q1gz24cw7i46.css",
  "https://paddleup.ph/_next/static/chunks/1zk1by0fu7w3z.css",
  "https://paddleup.ph/_next/static/chunks/1x6obpmlu1_c2.js",
  "https://paddleup.ph/_next/static/chunks/2n86e7h60o0qo.js",
  "https://paddleup.ph/_next/static/chunks/2khxl0v1q4i6n.js",
  "https://paddleup.ph/_next/static/chunks/2pgxx1eld5ef_.js",
  "https://paddleup.ph/_next/static/chunks/turbopack-3-ry682tkyiqk.js",
  "https://paddleup.ph/_next/static/chunks/0umf92h1sb77c.js",
  "https://paddleup.ph/_next/static/chunks/1fujnc_u--432.js",
  "https://paddleup.ph/_next/static/chunks/2n5qeheznvl4u.js",
  "https://paddleup.ph/_next/static/chunks/1e5juexvjllyx.js",
  "https://paddleup.ph/manifest.webmanifest",
  "https://paddleup.ph/icon.svg?icon.3097gr4tc2zso.svg",
  "https://paddleup.ph/icons/icon-192.png",
  "https://paddleup.ph/_next/static/chunks/1u9dsutcnsye8.js",
  "https://paddleup.ph/_next/static/chunks/3t2nbery9uokx.js",
  "https://paddleup.ph/_next/static/chunks/0axfra5kwz6z1.js",
  "https://paddleup.ph/_next/static/chunks/0ypohqpl3fqrx.js",
  "https://paddleup.ph/_next/static/chunks/1j_nv46-g8z0r.js",
  "https://paddleup.ph/rally/characters.gltf",
  "https://paddleup.ph/rally/characters.bin",
  "https://paddleup.ph/rally/characters-colormap.png",
  "https://paddleup.ph/_next/static/chunks/35zd0-0_umont.js",
  "https://paddleup.ph/_next/static/chunks/2rht7llolu9he.js"
];
for (const url of urls) {
  const u = new URL(url);
  const file = path.join(root, u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  await mkdir(path.dirname(file), {recursive:true});
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(file, bytes);
  console.log(`${bytes.length} ${u.pathname}`);
}

