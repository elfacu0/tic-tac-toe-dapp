var fs = require('fs');
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    GAME_ID: process.env.GAME_ID || fs.readFileSync('.soroban/game_id').toString().trim(),
    DEPLOYER_ID: process.env.DEPLOYER_ID || fs.readFileSync('.soroban/deployer_id').toString().trim(),
    TOKEN_ADMIN_ADDRESS: process.env.TOKEN_ADMIN_ADDRESS || fs.readFileSync('.soroban/token_admin_address').toString().trim(),
    TOKEN_ADMIN_SECRET: process.env.TOKEN_ADMIN_SECRET || fs.readFileSync('.soroban/token_admin_secret').toString().trim(),
    TOKEN_ID: process.env.TOKEN_ID || fs.readFileSync('.soroban/token_id').toString().trim(),
  },
};
