/* task.js
 * 
 * This file holds the main experiment code.
 * 
 * Requires:
 *   config.js
 *   psiturk.js
 *   utils.js
 */

// Create and initialize the experiment configuration object
var $c = new Config(condition, counterbalance);

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc);

// Preload the HTML template pages that we need for the experiment
psiTurk.preloadPages($c.pages);

// Objects to keep track of the current phase and state
var CURRENTVIEW;
var STATE;

/*************************
 * INSTRUCTIONS         
 *************************/

var Instructions = function() {

    // The list of pages for this set of instructions
    this.pages = $c.instructions.pages;

    // Display a page of instructions, based on the current
    // STATE.index
    this.show = function() {
        debug("show slide " + this.pages[STATE.index]);

        // Load the next page of instructions
        $(".slide").hide();
        var slide = $("#" + this.pages[STATE.index]);
        slide.fadeIn($c.fade);

        // Bind a handler to the "next" button. We have to wrap it in
        // an anonymous function to preserve the scope.
        var that = this;
        slide.find('.next').click(function () {
            that.record_response();
        });

    };

    // Handler for when the "next" button is pressed
    this.record_response = function() {
        // Go to the next page of instructions, or complete these
        // instructions if there are no more pages
        if ((STATE.index + 1) >= this.pages.length) {
            this.finish(); 
        } else {
            STATE.set_index(STATE.index + 1);
            this.show();
        }
    };

    // Clean up the instructions phase and move on to the test phase
    this.finish = function() {
        // debug("Done with instructions") ;

        // Record that the user has finished the instructions and
        // moved on to the experiment. This changes their status
        // code in the database.
        psiTurk.finishInstructions();

        // Reset the state object for the test phase
        STATE.set_instructions(0);
        STATE.set_index();
        CURRENTVIEW = new TestPhase();
    };

    // Display the first page of instructions
    this.show();
};



/*****************
 *  TRIALS       *
 *****************/

var TestPhase = function() {
    /* Instance variables */
    
    // Information about the current trial
    this.trialinfo;    
    // The response they gave
    this.response;
    // The number they've gotten correct, so far
    this.num_correct = 0;

    // Initialize a new trial. This is called either at the beginning
    // of a new trial, or if the page is reloaded between trials.
    this.init_trial = function () {
        debug("Initializing trial " + STATE.index);

        // If there are no more trials left, then we are at the end of
        // this phase
        if (STATE.index >= $c.trials.length) { //change here for debugging
            this.finish();
            return false;
        }

        
        // Load the new trialinfo
        this.trialinfo = $c.trials[STATE.index];

        // Update progress bar
        update_progress(STATE.index, $c.trials.length);

        return true;
    }; 

    this.display_stim = function (that) {
        if (that.init_trial()) {
            debug("Show STIMULUS");
            // Show stimuli

            var voters = [];
            for (var i=0; i<that.trialinfo.focus.length; i++) {
                if (that.trialinfo.focus[i] == 1){
                    voters.push(that.trialinfo.names[i]);
                }
            }
            //hacky way to make sure that there are always at least 2 voters ...
            voters.push("NA");

            // Replace the name with the piece from the template
            // select a random name from the choices
            var view = {
                'voter1': voters[0],
                'voter2': voters[1],
                'outcome': that.trialinfo.outcome
            } ;
            // debugger;


            var color = 'blue'
            if (that.trialinfo.support == "Republican"){
                color = 'red'
            }

            $('#prompt-text').html(Mustache.render($c.prompt, view));
            $('.stim_text').html(Mustache.render($c.text, view));


            //policy information
            var policy_number = Math.floor(Math.random()*999999) + 100000;
            $('#policy_text').html('<p><b>Number</b>: #' + policy_number + '</p>');
            $('#policy_support').html('<p><b>Supported by</b>: <font color = "' + color + '"> The ' + that.trialinfo.support + ' party</font></p>');
            
            $('#voters').html('<p><b>Number of people in the committee</b>: ' + that.trialinfo.names.length + '</p>');

            $('#vote_rule').html('<p><b>Number of votes in favor of policy required</b>: ' + that.trialinfo.rule + '</p>');
            

            //table for actual votes 
            html = ""
            html = '<tr><th></th><th>Party affiliation</th><th>Vote (&#10004 = for, &#10008 = against)</th>'
            for (var i=0; i<that.trialinfo.names.length; i++) {
                var voter_name = that.trialinfo.names[i];
                var voter_vote = that.trialinfo.vote[i];
                var vote 
                if (voter_vote == 1){
                    vote = '&#10004';    
                }else{
                    vote = '&#10008';    
                }

                var party = that.trialinfo.party[i];
                if (that.trialinfo.support == 'Democratic'){
                        if (party == 0){
                            party = 'Republican';
                        }else{
                            party = 'Democrat';
                        }
                    }else{
                        if (party == 0){
                            party = 'Democrat';
                        }else{
                            party = 'Republican';
                        }
                    }

                var color;
                if (party == 'Republican'){
                    color = "red";
                }else{color = "blue";}
                html += '<tr><td>'+voter_name+'</td><td><font color = "'+ color + '">' + party+'</font></td><td>' + vote + '</td></tr>';
                // debugger;
            }
            
            $('#table_vote').html(html);

            var votes_for = that.trialinfo.vote.reduce(function(a, b) {
                return a + b;
            });

            //number of votes required
            var votes_required = '';
            if (this.trialinfo.rule > 1){
            votes_required = this.trialinfo.rule + ' votes were';
            }else{
                votes_required = this.trialinfo.rule + ' vote was';
            }

            $('#vote_outcome').html('<p style="font-size:20px"><b>Outcome</b>: The policy was <b>' + that.trialinfo.outcome + '</b>.</p><p style="font-size:18px">' + votes_for + ' out of '+ that.trialinfo.names.length + ' committee members voted in favor of the policy and '+ votes_required + ' required for the policy to pass.</p>')

            // Create the HTML for the question and slider.
            var html = "" ; 
            for (var i=0; i<voters.length-1; i++) {
                var q = Mustache.render($c.questions[i].q, view);
                // html += '<p class=".question">' + (i+1) + '. ' + q +'</p><div class="s-'+i+'"></div><div class="l-'+i+'"></div><br />' ;
                html += '<p class=".question">' + q +'</p><div class="s-'+i+'"></div><div class="l-'+i+'"></div><br />' ;
            }
            $('#choices').html(html) ;

            // Bulid the sliders for each question
            for (var i=0; i<voters.length-1; i++) {
                // Create the sliders
                $('.s-'+i).slider().on("slidestart", function( event, ui ) {
                    // Show the handle
                    $(this).find('.ui-slider-handle').show() ;

                    // Sum is the number of sliders that have been clicked
                    var sum = 0 ;
                    for (var j=0; j<voters.length-1; j++) {
                        if ($('.s-'+j).find('.ui-slider-handle').is(":visible")) {
                            sum++ ;
                        }
                    }
                    // If the number of sliders clicked is equal to the number of sliders
                    // the user can continue. 
                    if (sum == voters.length-1) {
                        $('#trial_next').prop('disabled', false) ;
                    }
                });
                                       
                // Put labels on the sliders
                $('.l-'+i).append("<label style='width: 33%'>"+ Mustache.render($c.questions[0].l[0], view) +"</label>") ; 
                $('.l-'+i).append("<label style='width: 33%'>"+ Mustache.render($c.questions[0].l[1], view) +"</label>") ; 
                $('.l-'+i).append("<label style='width: 33%'>"+ Mustache.render($c.questions[0].l[2], view) +"</label>");
            }

            // Hide all the slider handles 
            $('.ui-slider-handle').hide() ;

            // Disable button which will be enabled once the sliders are clicked
            $('#trial_next').prop('disabled', true);

            debug(that.trialinfo);
        }        
    };

    // Record a response (this could be either just clicking "start",
    // or actually a choice to the prompt(s))
    
    // this.record_response = function() {        
    //     var response = [] ;
    //     saveid = this.trialinfo.ID ;
    //     for (var i=0; i<$c.questions.length; i++) {
    //         response.push($('.s-'+i).slider('value')) ;
    //     }

    //     psiTurk.recordTrialData(["trial_".concat(saveid), "judgments", response, "intention", this.trialinfo.intention, "vote", this.trialinfo.vote, "outcome", this.trialinfo.outcome])

    this.record_response = function() {        
        var response = ['NA','NA','NA','NA','NA'] ;
        saveid = this.trialinfo.ID ;
        
        var slidernr = 0    
        for (var i=0; i<this.trialinfo.focus.length; i++) {
            if (this.trialinfo.focus[i] == 1){
            response[i] =  $('.s-'+slidernr).slider('value')   
            slidernr = slidernr+1;
            }
        }
        debug(response)
        psiTurk.recordTrialData(["trial_".concat(saveid), "judgments", response, "party", this.trialinfo.party, "vote", this.trialinfo.vote, "support", this.trialinfo.support, "rule", this.trialinfo.rule, "outcome", this.trialinfo.outcome])

        STATE.set_index(STATE.index + 1);
        
        // Update the page with the current phase/trial
        this.display_stim(this);
    };

     this.finish = function() {
        debug("Finish test phase");

        // Change the page
        CURRENTVIEW = new Demographics()
    };

    // Load the trial html page
    $(".slide").hide();

    // Show the slide
    var that = this; 
    $("#trial").fadeIn($c.fade);
    $('#trial_next.next').click(function () {
        that.record_response();
    });


    // Initialize the current trial
    if (this.init_trial()) {
        // Start the test
        this.display_stim(this) ;
    };
};

/*****************
 *  DEMOGRAPHICS*
 *****************/

 var Demographics = function(){

var that = this;

psiTurk.showPage("demographics.html");

    //disable button initially
    $('#trial_finish').prop('disabled', true);

    //checks whether all questions were answered
    $('.demoQ').change(function () {
       if ($('input[name=sex]:checked').length > 0 &&
         $('input[name=age]').val() != "")
       {
            $('#trial_finish').prop('disabled', false)
       }else{
        $('#trial_finish').prop('disabled', true)
       }
    });

// deletes additional values in the number fields 
$('.numberQ').change(function (e) {    
    if($(e.target).val() > 100){
        $(e.target).val(100)
    }
});

    this.finish = function() {
        debug("Finish test phase");

        // Show a page saying that the HIT is resubmitting, and
        // show the error page again if it times out or error
        var resubmit = function() {
            $(".slide").hide();
            $("#resubmit_slide").fadeIn($c.fade);

            var reprompt = setTimeout(prompt_resubmit, 10000);
            psiTurk.saveData({
                success: function() {
                    clearInterval(reprompt); 
                    finish();
                }, 
                error: prompt_resubmit
            });
        };

        // Prompt them to resubmit the HIT, because it failed the first time
        var prompt_resubmit = function() {
            $("#resubmit_slide").click(resubmit);
            $(".slide").hide();
            $("#submit_error_slide").fadeIn($c.fade);
        };

        // Render a page saying it's submitting
        psiTurk.showPage("submit.html") ;
        psiTurk.saveData({
            success: psiTurk.completeHIT, 
            error: prompt_resubmit
        });
    }; //this.finish function end 

    $('.next').click(function () {           
             var feedback = $('textarea[name = feedback]').val();
             var sex = $('input[name=sex]:checked').val();
             var age = $('input[name=age]').val();

            psiTurk.recordUnstructuredData('feedback',feedback);
            psiTurk.recordUnstructuredData('sex',sex);
            psiTurk.recordUnstructuredData('age',age);
            that.finish();
    });
 };

// --------------------------------------------------------------------
// --------------------------------------------------------------------

/*******************
 * Run Task
 ******************/

$(document).ready(function() { 
    // Load the HTML for the trials
    psiTurk.showPage("trial.html");

    // Record various unstructured data
    psiTurk.recordUnstructuredData("condition", condition);
    psiTurk.recordUnstructuredData("counterbalance", counterbalance);

    // Start the experiment
    STATE = new State();
    // Begin the experiment phase
    if (STATE.instructions) {
        CURRENTVIEW = new Instructions();
    } else {
        CURRENTVIEW = new TestPhase();
    }
});
