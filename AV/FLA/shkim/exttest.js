"use strict";
/*global alert: true, ODSA */

(function ($) {
	var jsav = new JSAV("av"),
		saved = false,
		//startState,
		selectedNode = null,
		arr,
		g;
	//Empty string can be set to anything when initializing the graph:
	//e.g. initGraph({layout: "automatic", emptystring: epsilon})
	//By default it is set to lambda.
	var lambda = String.fromCharCode(955),
		epsilon = String.fromCharCode(949);
	/*
	graph:
	initial state is filled green
	current states (during slideshow) are filled blue
	array:
	characters already traversed are highlighted yellow
	if a character is not accepted, it is filled red
	if the inputted string passes, the final character is filled green

	Add lambda transitions by setting weight to empty string.

	The values of the FA nodes should never be changed manually (for now)
	*/

	var initGraph = function(opts) {
		if (!saved) {
			g = jsav.ds.fa($.extend({width: '90%', height: 440}, opts));
	  		var a = g.addNode(),		
	      		b = g.addNode(),
	      		c = g.addNode(),
	      		d = g.addNode();
	      	g.makeInitial(a);
	      	c.addClass("final");
	      	d.addClass('final');

		    g.addEdge(a, a, {weight: 'a'});
		    //g.addEdge(b, a, {weight: 'c'}).highlight(); //does edge.highlight() do anything?	
		    g.addEdge(a, b, {weight: 'a'});
		    g.addEdge(b, b, {weight: 'b'});
		    g.addEdge(b, c, {weight: 'b'});
		    g.addEdge(c, d, {weight: 'a'});
		    g.addEdge(d, b, {weight: 'b'});
		    g.addEdge(d, c, {weight: ''});	//lambda
		
			addHandlers();
		}
		else {
			var x = document.getElementById("loadFile").files[0];
			var reader = new FileReader();
			reader.onload = loadComplete;
			reader.readAsText(x);
		}
		function loadComplete() {
				g = reader.result,
			//var g = localStorage['graph'],
				gg = jQuery.parseJSON(g),
			//BUG: if height is set to a %, loading a graph causes the height of the jsavgraph element to increase by a few pixels every time
				graph = jsav.ds.fa($.extend({width: '90%', height: 440}, opts));
			for (var i = 0; i < gg.nodes.length; i++) {
				//the 'left' and 'top' options arent working for some reason
	    		//var node = graph.addNode("q" + i, {'left': parseInt(gg.nodes[i].left), 'top': parseInt(gg.nodes[i].top)});
	    		var node = graph.addNode('q' + i),
	    			offset = $('.jsavgraph').offset(),
	    			offset2 = parseInt($('.jsavgraph').css('border-width'), 10);
	    		$(node.element).offset({top : parseInt(gg.nodes[i].top) + offset.top + offset2, left: parseInt(gg.nodes[i].left) + offset.left + offset2});
	    		if (gg.nodes[i].i) {
	    			graph.makeInitial(node);
	    		}
	    		if (gg.nodes[i].f) {
	    			node.addClass("final");
	    		}
	  		}
	  		for (var i = 0; i < gg.edges.length; i++) {
	    		if (gg.edges[i].weight !== undefined) {
	      			var edge = graph.addEdge(graph.nodes()[gg.edges[i].start], graph.nodes()[gg.edges[i].end], {weight: (gg.edges[i].weight)});
	    		}
	    		else {
	      			var edge = graph.addEdge(graph.nodes()[gg.edges[i].start], graph.nodes()[gg.edges[i].end]);
	    		}
	    		edge.layout();
	    	}
	    	g = graph;
	    	addHandlers();
		}
		return g;
	};
	function addHandlers() {
		$(".jsavgraph").click(function(e) {
			if ($(".jsavgraph").hasClass("addNodes")) {
				var newNode = g.addNode(),
				    nodeX = newNode.element.width()/2.0,
					nodeY = newNode.element.height()/2.0;
				$(newNode.element).offset({top: e.pageY - nodeY, left: e.pageX - nodeX});
			} 
			else if ($('.jsavgraph').hasClass('moveNodes') && selectedNode != null) {
				var nodeX = selectedNode.element.width()/2.0,
					nodeY = selectedNode.element.height()/2.0,
					edges = g.edges();
				$(selectedNode.element).offset({top: e.pageY - nodeY, left: e.pageX - nodeX});
				selectedNode.stateLabelPositionUpdate();
				for (var next = edges.next(); next; next = edges.next()) {
					if (next.start().equals(selectedNode) || next.end().equals(selectedNode)) {
						next.layout();
					}
				}
				selectedNode.unhighlight();
				selectedNode = null;
				e.stopPropagation();
				jsav.umsg("Click a node");
			}
		});
		//add eventhandlers to nodes
		g.click(function(e) {	
			if ($(".jsavgraph").hasClass("editNodes")) {
				this.highlight();
				var input = prompt("Delete state, make state initial, make state final, or give state a label? d, i, f, or l");
				if (input === null) {
					this.unhighlight();
					return;
				}
				input = input.toUpperCase();
				if (input == 'D') {
					g.removeNode(this);
					updateAlphabet();
				}
				else if (input == 'I') {
					var nodes = g.nodes();
					for (var next = nodes.next(); next; next = nodes.next()) {
						g.removeInitial(next);
					}
					// for (var i = 0; i < g.nodeCount(); i++) {
					// 	g.nodes()[i].removeClass('start');
					// 	g.removeInitial(g.nodes()[i]);
					// }
					g.makeInitial(this);
				} else if (input == 'F') {
					this.toggleClass('final');
				} 
				//adds labels to states
				else if (input == 'L') {
					var input2 = prompt("Label?");
					if (input2 !== null) {
						//this.element.attr('title', input2);
						this.stateLabel(input2);
						this.stateLabelPositionUpdate();
					}
				}
	   			this.unhighlight();
				} else if ($(".jsavgraph").hasClass("addEdges")) {
					this.highlight();
					if (!$(".jsavgraph").hasClass("working")) {
					first = this;
					$('.jsavgraph').addClass("working");
					jsav.umsg("Select a node to make an edge to");
	   			} else {
	   				var input2 = prompt("Accepted character?");
	   				var newEdge;
					// if (input2 === "") {
					// 	newEdge = g.addEdge(first, this, {weight: "\&lambda;"});
					// } else 
					if (input2 != null) {
						newEdge = g.addEdge(first, this, {weight: input2});
					} 
					if (!(typeof newEdge === 'undefined')) {
						newEdge.layout();
					}
					$('.jsavgraph').removeClass("working");
					first.unhighlight();
					this.unhighlight();
					updateAlphabet();
					jsav.umsg("Click a node");
	   			}
				} else if ($('.jsavgraph').hasClass('moveNodes')) {
					this.highlight();
					selectedNode = this;
					jsav.umsg("Click to place node");
					e.stopPropagation();
				}
			});
		//add eventhandlers to edges
		g.click(function(e) {
			if ($('.jsavgraph').hasClass('editNodes')) {
				this.highlight();
				var input = prompt("Delete edge, or change value? d or c");
				if (input === null) {
					this.unhighlight();
					return;
				}
				input = input.toUpperCase();
				if (input == 'D') {
					g.removeEdge(this);
				}
				else if (input == 'C') {
					var input2 = prompt("Accepted character?");
					// if (input2 === "") {
					// 	this.weight("\&lambda;");
					// } else 
					if (input2 != null) {
						this.weight(input2);
					} 
				}
				updateAlphabet();
				this.unhighlight();
			}
		}, {edge: true});
	};

	localStorage.clear();
	var g = initGraph({layout: "automatic"});
	//var g = initGraph({layout: "automatic", emptystring: epsilon});
	g.layout();
	jsav.displayInit();
	//===============================
	var updateAlphabet = function() {
		g.updateAlphabet();
		$("#alphabet").html("" + Object.keys(g.alphabet).sort());
	};
	updateAlphabet();

	//================================
	//editing modes

	var addNodesMode = function() {
		$(".jsavgraph").removeClass("addEdges");
		$(".jsavgraph").removeClass("moveNodes");
		$(".jsavgraph").removeClass("editNodes");
		$(".jsavgraph").addClass("addNodes");
		$("#mode").html('Adding nodes');
		jsav.umsg("Click to add nodes");
	};

	var addEdgesMode = function() {
		$(".jsavgraph").removeClass("addNodes");
		$(".jsavgraph").removeClass("moveNodes");
		$(".jsavgraph").removeClass("editNodes");
		$(".jsavgraph").addClass("addEdges");
		$("#mode").html('Adding edges');
		jsav.umsg("Click a node");
	};

	var moveNodesMode = function() {
		$(".jsavgraph").removeClass("addNodes");
		$(".jsavgraph").removeClass("addEdges");
		$(".jsavgraph").removeClass("editNodes");
		$(".jsavgraph").addClass("moveNodes");
		$("#mode").html('Moving nodes');
		jsav.umsg("Click a node");
	};

	var editNodesMode = function() {
		$(".jsavgraph").removeClass("addNodes");
		$(".jsavgraph").removeClass("addEdges");
		$(".jsavgraph").removeClass("moveNodes");
		$(".jsavgraph").addClass("editNodes");
		$("#mode").html('Editing nodes and edges');
		jsav.umsg("Click a node or edge");
	};

	var changeEditingMode = function() {
		$(".jsavgraph").removeClass("addNodes");
		$(".jsavgraph").removeClass("addEdges");
		$(".jsavgraph").removeClass("moveNodes");
		$('.jsavgraph').removeClass('editNodes');
		$("#mode").html('Editing');
		if ($(".notEditing").is(":visible")) {
			$('#changeButton').html('Done editing');
		} else {
			$('#changeButton').html('Edit');
		}
		$('.notEditing').toggle();
		$('.editing').toggle();
	}

	//====================
	//tests

	var testND = function() {
		$('#changeButton').toggleClass("highlightingND");
		if ($('#changeButton').hasClass("highlightingND") || $('#changeButton').hasClass("highlightingL")) {
			$('#changeButton').hide();
		} else{
			$('#changeButton').show();
		}
		var nodes = g.nodes();
		for(var next = nodes.next(); next; next = nodes.next()) {
			var edges = next.getOutgoing();
			var weights = _.map(edges, function(e) {return e.weight()});
			if (_.contains(weights, g.emptystring) || _.uniq(weights).length < weights.length) {
				next.toggleClass("testingND");
			}
		}
	};

	var testLambda = function() {
		$('#changeButton').toggleClass("highlightingL");
		if ($('#changeButton').hasClass("highlightingND") || $('#changeButton').hasClass("highlightingL")) {
			$('#changeButton').hide();
		} else{
			$('#changeButton').show();
		}
		var edges = g.edges();
		for (var next = edges.next(); next; next = edges.next()) {
			if (next.weight().indexOf(g.emptystring) !== -1) {
				next.g.element.toggleClass('testingLambda');
			}
		}
	};


	//====================
	//temp:

	var play = function() {
		var inputString = prompt("Input string?", "aaa");
		if (inputString === null) {
			return;
		}
		jsav.umsg("");
		var textArray = [];
		$("button").hide();			//disable buttons
		$('#reset').show();
		$("#mode").html('');
		if (arr) {
			arr.clear();
		}
		$('.jsavcontrols').show();
		

		var currentState = g.initial,
			cur;
		currentState.addClass('current');
		for (var i = 0; i < inputString.length; i++) {
			textArray.push(inputString[i]);
			}
			arr = jsav.ds.array(textArray, {element: $('.arrayPlace')});

			jsav.displayInit();

		for (var i = 0; i < inputString.length; i++) {
		   	cur = traverse(currentState, inputString[i]);
		   	if (cur == null) {
		   		arr.css(i, {"background-color": "red"});
		   		jsav.step();
		   		break;
		   	}
		   	currentState.removeClass('current');
			currentState = cur;
			currentState.addClass('current');
			arr.css(i, {"background-color": "yellow"});
			jsav.step();
		}
		if (currentState.hasClass('final') && cur != null) {
				arr.css(inputString.length - 1, {"background-color": "green"});
				jsav.umsg("Accepted");
		} else {
			arr.css(inputString.length - 1, {"background-color": "red"});
			jsav.umsg("Rejected");
		}
		jsav.step();
		jsav.recorded();	
	};
	var traverse = function(currentState, letter) {
		var successors = currentState.neighbors();
		for (var next = successors.next(); next; next = successors.next()) {
			var weight = g.getEdge(currentState, next).weight().split(',');
			for (var i = 0; i < weight.length; i++) {
				if (letter == weight[i]) {
					return next;
				}
			}
		} 
		return null;
	};

	//======================
	var save = function () {
		localStorage['graph'] = serialize(g);	//I changed serializableGraph.js
		jsav.umsg("Saved");
	};

	// var save = function () {
	// 	localStorage['graph'] = serialize(g);	//I changed serializableGraph.js
	// 	//saved = true;
	// 	var downloadData = "text/json;charset=utf-8," + encodeURIComponent(localStorage['graph']);
	// 	$('#download').html('<a href="data:' + downloadData + '" download="data.json">download JSON</a>');
	// 	//$('<a href="data:' + downloadData + '" download="data.json">download JSON</a>').trigger('click');
	// 	jsav.umsg("Saved");
	// };
	// var load = function () {
	// 	if (saved) {
	// 		//g.hide();		//g.clear() didn't seem to do anything
	// 						//would like a reset button - should look at openDSA reset
	// 		$('.jsavgraph').remove(); 
	// 		g = initGraph({layout: "automatic"});
	// 		jsav.displayInit();
	// 		jsav.umsg("Loaded");
	// 		updateAlphabet();
	// 	} else{
	// 		jsav.umsg("There is nothing to load");
	// 	}
	// };
	// var setSaved = function () {
	// 	saved = true;
	// };

  	$('#reset').click(function() {
  		ODSA.AV.reset();
  		$("button").show();
  	});
  	$('#playbutton').click(play);
	$('#layoutbutton').click(function() {g.layout()});
  	$('#testndbutton').click(testND);
  	$('#testlambdabutton').click(testLambda);
  	$('#saveButton').click(save);
  	$('#addnodesbutton').click(addNodesMode);
	$('#changeButton').click(changeEditingMode);
	$('#addedgesbutton').click(addEdgesMode);
	$('#movenodesbutton').click(moveNodesMode);
	$('#editnodesbutton').click(editNodesMode);
}(jQuery));	