


function isAddress(str){
  return /^0x[0-9a-zA-F]{40}$/.test(str)
}

function isPrivate(str){
  return /^0x[0-9a-zA-F]{64}$/.test(str)
}

module.exports = {
  isAddress: isAddress,
  isPrivate: isPrivate
}
