let store={};
module.exports={
  getItem:(k)=>Promise.resolve(store[k]??null),
  setItem:(k,v)=>{store[k]=v;return Promise.resolve();},
  removeItem:(k)=>{delete store[k];return Promise.resolve();},
};
