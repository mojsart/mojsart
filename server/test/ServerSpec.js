var request = require('supertest');
var express = require('express');
var fs = require('fs');
var Q = require('q');
var expect = require('chai').expect;

var app = require('../main/app.js');
var Song = require('../song/song_model.js');
var helpers = require('../song/song_helpers.js');


/////////////////////////////////////////////////////
// NOTE: these tests are designed for mongo!
/////////////////////////////////////////////////////

describe('', function() {
  after(function(done) {
    Song.remove({filename: 'testmp3.mp3'}).exec();
    done();
  });

  describe('Helper tests: ', function() {
    describe('Regex filter tests: ', function() {
      it('Should reject non mp3s', function(done) {
        var bool = helpers.filenameRegEx('testing.jpg');
        expect(bool).to.equal(false);
        done();
      });

      it('Should accept mp3s', function(done) {
        var bool = helpers.filenameRegEx('testing.mp3');
        expect(bool).to.equal(true);
        done();
      });
    });
    // assumes testmp3.mp3 is in the testData directory 
    describe('Simulate upload song workflow: ', function() {
      describe('Save Song: ', function() {
        before(function(done){
          var testTrack = {
            status: 'pending'
          };
          helpers.saveSong(testTrack, 'testmp3.mp3');
          done();          
        });
        it('Creates a song shell using filename and status pending', function(done){
          Song.findOne({'filename' : 'testmp3.mp3'})
            .exec(function(err,track){
              if(err) console.log(err);
              console.log(track)
              expect(track.filename).to.equal('testmp3.mp3');
              expect(track.echoData.status).to.equal('pending');
              expect(track.echoData.md5).to.equal(undefined);
              done();            
            });
        });
        // mocha + echoNest requests don't play nice because of latency 
        // so just testing update with sample echoNest Response
        describe('Updates Song: ', function(){
          before(function(done) {
            var echoNestResp = { 
              status: 'complete',
              artist: 'Example',
              title: 'Midnight Run',
              id: 'TRXNBPG133FB7B072C',
              audio_summary: { 
                time_signature: 4,
                tempo: 134.932,
                energy: 0.5581707976539305,
                liveness: 0.04992618683753765,
                speechiness: 0.15087621125511358,
                acousticness: 0.15821946124844746,
                danceability: 0.5350467565711435,
                key: 5,
                duration: 243.93143,
                loudness: -13.93,
                valence: 0.5543240577074416,
                mode: 0 
              },
              bitrate: 128,
              samplerate: 44100,
              md5: '23f455935fafa3107ae7f4a9298f893b' 
            };
            helpers.updateSong(echoNestResp, 'testmp3.mp3');
            done();
          });

          it('Updates original entry with updated information', function(done) {
            Song.find({'filename' : 'testmp3.mp3'})
              .exec(function(err,tracks){
                if(err) console.log(err);
                expect(tracks.length).to.equal(1);
                expect(tracks[0].filename).to.equal('testmp3.mp3');
                expect(tracks[0].echoData.status).to.equal('complete');
                expect(tracks[0].echoData.md5).to.equal('23f455935fafa3107ae7f4a9298f893b');
                done();            
            });
          });
        });
      });
    });
  });

  describe('Server Actions: ', function() {
    describe('Upload songs from client: ', function() {
      // I have no idea how to simulate multipart.
    });

    describe('Serves song data to clients: ', function() {
      before(function(done) {
        var testTrack = {
          status: 'complete'
        };
        helpers.saveSong(testTrack, 'testing.mp3');
        done();
      });

      after(function(done) {
        Song.remove({'filename' : 'testing.mp3'}).exec();
        done();
      });

      it('Accepts get requests on /song', function(done){
        request(app)
          .get('/song')
          .expect(200)
          .end(done);
      });
      it('Responds to get requests on /song with song data', function(done){
        request(app)
          .get('/song')
          .expect(function(res) {
            Song.findOne({'filename' : 'testing.mp3'})
              .exec(function(err,song){
                if(err) console.log(err);
                expect(song.echoData.status).to.equal('complete');
              });            
          })
          .end(done);
      });
    }); 

    describe('Allows Users to post feedback: ', function() {
      // TODO: Add non-nonsense test for posting feedback
      before(function(done) {
        var song = new Song({
          echoData:  { 
            status: 'complete',
            artist: 'feedbackartist',
            title: 'feedbacktitle',
            id: 'feedbackid',
            audio_summary: { 
              time_signature: 1,
              tempo: 1,
              energy: 1, 
              liveness: 1,
              speechiness: 1,
              acousticness: 1,
              danceability: 1,
              key: 1,
              duration: 1,
              loudness: -1,
              valence: 1,
              mode: 0 
            },
            bitrate: 1,
            samplerate: 1,
            md5: 'abcde12356testingfeedback' 
          },
          userData: {
            speechiness: null,
            acousticness: null        
          },
          filename: 'feedback.mp3'
        });  
        console.log('saving new song', song);
        var $promise = Q.nbind(song.save, song);
        $promise()
          .then(function(saved) {
            console.log('song saved', saved);
            done();
          });
      });

      after(function(done) {
        Song.remove({'filename' : 'feedback.mp3'}).exec();
        done();
      });

      it('Should allow user input to be saved', function(done){
        request(app)
          .post('/song')
          .send({
            base: '23f455935fafa3107ae7f4a9298f893b', // md5 1
            compare: 'abcde12356testingfeedback', // md5 2
            increment: 1
          })
          .expect(200)
          .end(done);
      });

      it('Should reflect user input in db', function(done) {
        Song.findOne({'echoData.md5': 'abcde12356testingfeedback'}, function(err, song) {
          expect(song.userData.speechiness).to.not.equal(null);
          Song.findOne({'echoData.md5':'23f455935fafa3107ae7f4a9298f893b'}, function(err, song) {
            expect(song.userData.speechiness).to.not.equal(null);
            done();
          })
        });
      });

      it('Should 404 for nonsense posts allow', function(done){
        request(app)
          .post('/song')
          .send({
            'nonsense' : 'nonsense'
          })
          .expect(404)
          .end(done);
      });
    }); 

    describe('Plays songs when requested: ', function() {
      var oldPath = __dirname + '/testmp3/testmp3.mp3';
      var newPath = __dirname.split('/');
      newPath.pop();
      newPath = newPath.join('/') + '/song/lib/testmp3.mp3';

      before(function(done) {
        fs.rename(oldPath, newPath, function(err) {
          if (err) console.log(err);
          done();
        });
      });

      after(function(done) {
        fs.rename(newPath, oldPath, function(err) {
          if (err) console.log(err);
          done();
        });
      });

      it('Serves requested songs', function(done) {
        request(app)
          .get('/song/get/md5/23f455935fafa3107ae7f4a9298f893b')
          .expect(200)
          .expect(function(res) {
            expect(res.type).to.equal('audio/mpeg');
          })
          .end(done);   
      });

      it("Doesn't serve songs that don't exist", function(done) {
        request(app)
          .get('/song/get/md5/thisisinotamd5')
          .expect(404)
          .end(done);
      });
    });
  });
});
