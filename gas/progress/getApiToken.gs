function getApiToken() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiToken = scriptProperties.getProperty('API_TOKEN');
  return apiToken;
}
var apiToken = getApiToken();

