var Song = require('../song/song_model.js'),
    Q    = require('q'),
    echo = require('./echo.js'),
    SongHelpers = require('../song/song_helpers.js');

// hard coded md5 ids to load into db
var songArr = [
  'cfa55a902533b32e87473c2218b39da9',
  'abe657f8ae463c3bcffad1edeffd39dd',
  'bee14af93b28fa87a1c400eae7aa91eb',
  'b1285f7f3cfa054e770317d5a2c818e8',
  '055ae3af45d74e7b5540b2d1f54e0ca7',
  '940109abd71f345364cad7c0da87b557',
  'ace6617a8a9c7a85cda950770ba57d54',
  'e40af321ed0a03832d74a132e9905ff4',
  '60f4ae28bcd5fa934790519efa2179f7',
  'fd51d20c7c0f0641cab9cd5960b3f7d1'
];

module.exports = exports = function(req, res) {
  for (var i=0; i<songArr.length; i++){
    // asynchronus closure scope
    (function(counter) {
      // search for the md5
      console.log(songArr[counter])
      SongHelpers.checkSongMD5DB(songArr[counter], function(md5){
        console.log('checking md5', md5)
        var query = {bucket: 'audio_summary'};
        query.md5 = md5;
        SongHelpers.fetchSongMD5(query);        
      });
    })(i);
  }    
};