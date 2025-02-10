module.exports = {
  BEFORE: ':remote-addr :url :method HTTP/:http-version :user-agent :req[host]',
  AFTER:
    ':remote-addr :url :method :status :res[content-length] :req[host] :response-time ms',
};
