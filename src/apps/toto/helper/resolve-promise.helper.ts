export const resolvePromise = (resolve: (data: any) => {}, reject: (err: any) => {}) => {
  return (err: Error, data: any) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  };
};
