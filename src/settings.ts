export default {
  isDev: process.env.NODE_ENV == 'development',
  isProd: process.env.NODE_ENV == 'production',
  isTesting: process.env.NODE_ENV == 'testing',
  port: process.env.PORT,
  agentJid: process.env.PHONE_NUMBER + '@s.whatsapp.net',
  projectId: process.env.GCP_PROJECT_ID,
};
