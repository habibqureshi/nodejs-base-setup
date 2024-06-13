module.exports = {
  BEFORE:
    ':remote-addr :url :method HTTP/:http-version :user-agent :req[x-host]',
  AFTER:
    ':remote-addr :url :method :status :res[content-length] :req[x-host] :response-time ms',
};
