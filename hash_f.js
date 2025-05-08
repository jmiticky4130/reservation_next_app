import bcrypt from 'bcryptjs';

const res = await(bcrypt.hash('trnava', 10));
console.log(res);