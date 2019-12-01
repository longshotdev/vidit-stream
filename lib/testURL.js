module.exports = url => {
  urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/; // TODO: Make this img only
  return urlRegex.test(url);
};
