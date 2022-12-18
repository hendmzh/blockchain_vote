App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: function() {
    return App.initWeb3();
  },
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      window.ethereum.enable();
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract: function() {
    $.getJSON("Voting.json", function(Voting) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Voting = TruffleContract(Voting);
      // Connect provider to interact with contract
      App.contracts.Voting.setProvider(App.web3Provider);
      return App.render();
    });
  },
render: function() {
  var VotingInstance;
  var loader = $("#loader");
  var content = $("#content");

  var style = ["progress-danger", "progress-info", "progress-striped", "progress-success", "progress-warning"];
  loader.show();
  content.hide();
  // Load account data
  web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      App.account = account;
      $("#accountAddress").html("Your Account: " + account);
    }
  });
  // Load contract data
  App.contracts.Voting.deployed().then(function(instance) {
    VotingInstance = instance;
    return VotingInstance.itemsCount();
  }).then(function(itemsCount) {
    // var itemsResults = $("#itemsResults");
    // itemsResults.empty();
    // var itemsSelect = $('#itemsSelect');
    // itemsSelect.empty();
    // for (var i = 1; i <= itemsCount; i++) {
    //   VotingInstance.items(i).then(function(item) {
    //     var id = item[0];
    //     var name = item[1];
    //     var voteCount = item[2];
    //     // Render item Result
    //     var itemTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
    //     itemsResults.append(itemTemplate);
    //     // Render item ballot option
    //     var itemOption = "<option value='" + id + "' >" + name + "</ option>"
    //     itemsSelect.append(itemOption);


        var itemsResults = $("#itemsResults");
        itemsResults.empty();
        var itemsSelect = $('#itemsSelect');
        itemsSelect.empty();

        VotingInstance.votesCount().then(function(total) {

        for (var i = 1; i <= itemsCount; i++) {

        VotingInstance.items(i).then(function(item) {
        var id = item[0];
        var name = item[1];
        var voteCount = item[2];
        var percentage = voteCount / total;
        // Render item Result
        var itemTemplate = "<strong>" + name + "</strong><span class=\"pull-right\">" + Number(percentage*100).toFixed(0) + "% ("+voteCount+ " Votes)"+  "</span>" +

        "<div class=\"progress "+ style[id-1]+ " active\"> <div class=\"bar\" style=\"width:" + percentage*100+ "%;\"></div></div>"


        itemsResults.append(itemTemplate);
        // Render item ballot option
        var itemOption = "<option value='" + id + "' >" + name + "</ option>"
        itemsSelect.append(itemOption);


      });
    }


      });

    return VotingInstance.voters(App.account);
  }).then(function(hasVoted) {
    // Do not allow a user to vote
    if(hasVoted) {
      $('form').hide();
    }
    loader.hide();
    content.show();
  }).catch(function(error) {
    console.warn(error);
  });
}, 


castVote: function() {
    var itemId = $('#itemsSelect').val();
    App.contracts.Voting.deployed().then(function(instance) {
      return instance.vote(itemId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }


};
$(function() {
  $(window).load(function() {
    App.init();
  });
});