
const fs = require('fs-extra');
const path = require('path');


/**
 * conf - description
 *
 * @param  {string} cwd current working directory
 * @param  {string} dir directory subchain
 * @param  {string} pro project name
 * @return {type}     description
 */
async function conf(cwd, dir, pro) {
  const src = path.join(__dirname, 'rsc');
  const dst = path.join(cwd, dir, pro, 'src');

  await fs.remove(dst);
  await fs.copy(src, dst, {overwrite: true});

  const fig = path.join(cwd, dir, pro, 'conf.json');
  const obj = await fs.readJson(fig, {throws: false});
  obj.subchain = {'node': 'http://localhost:8035'};
  await fs.writeJson(fig, obj, {spaces: 2, EOL: '\n'});
}


/**
 * link - description
 *
 * @param  {string} pro   project path
 * @param  {bool} write write or not
 * @return {type}       description
 */
async function link(pro, write) {
  
}

module.exports.conf = conf;
module.exports = {
  conf: conf,
  link: link,
};
