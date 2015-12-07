/*global ODSA */
// Written by Sally Hamouda and Cliff Shaffer
// Visualization for winding and unwinding a series of function calls
$(document).ready(function () {
"use strict";
  var av_name = "recurTraceWindCON";
  
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
 //     code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  
  // Slide 1
  av.umsg(interpret("av_c1"));
  var  pseudo = av.code(" a()\n{ \n  b();  \n}" , {lineNumbers:false , top:0 , left:100}); 
  var Pointer1 = av.g.line(165, 80, 215, 30, {"arrow-end": "classic-wide-long",
                                              opacity: 0, stroke: "black", "stroke-width": 2});
  Pointer1.show(); 
  var  pseudo2 = av.code(" b()\n{ \n c();  \n}" , {lineNumbers:false , top:0 , left:200});
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("av_c2"));
  var Pointer2 = av.g.line(255, 80, 315, 30, {"arrow-end": "classic-wide-long",
                                              opacity: 0, stroke: "black", "stroke-width": 2});
  Pointer2.show(); 
  var  pseudo3 = av.code(" c()\n{ \n d();  \n}" , {lineNumbers: false, top: 0, left: 300});
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  var Pointer3 = av.g.line(355, 80, 415, 30, {"arrow-end": "classic-wide-long", opacity: 0,
                                              stroke: "black", "stroke-width": 2});
  Pointer3.show(); 
  var  pseudo4 = av.code(" d()\n{ \n      \n}" , {lineNumbers: false, top: 0, left: 400});
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  var Pointer4 = av.g.line(415, 80, 355, 30, {"arrow-end": "classic-wide-long", opacity: 0,
                                              stroke: "black", "stroke-width": 2});
  Pointer4.show(); 
  av.step();

  // Slide 6
  av.umsg(interpret("av_c6"));
  var Pointer5 = av.g.line(315, 80, 255, 30, {"arrow-end": "classic-wide-long", opacity: 0,
                                              stroke: "black", "stroke-width": 2});
  Pointer5.show();  
  av.step();
  
  // Slide 7
  av.umsg(interpret("av_c7"));
  var Pointer6 = av.g.line(215, 80, 165, 30, {"arrow-end": "classic-wide-long", opacity: 0,
                                              stroke: "black", "stroke-width": 2});
  Pointer6.show();
  av.step();

  // Slide 8
  av.umsg(interpret("av_c8"));
  Pointer4.hide();
  Pointer5.hide();
  Pointer6.hide();  
  Pointer1.show();
  Pointer2.show();
  Pointer3.show();
  av.step();

  // Slide 9
  av.umsg(interpret("av_c9"));
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  Pointer4.show();
  Pointer5.show();
  Pointer6.show();
  av.step();
  
  // Slide 10
  av.umsg(interpret("av_c10"));
  pseudo.hide();
  pseudo2.hide();
  pseudo3.hide(); 
  pseudo4.hide();
  Pointer4.hide();
  Pointer5.hide();
  Pointer6.hide();
  av.step();
  
  // Slide 11
  av.umsg(interpret("av_c11"));
  var  pseudo5 = av.code(" f()\n{ \n  f();  \n}" , {lineNumbers:false , top:0 , left:100}); 
  Pointer1.show(); 
  var  pseudo6 = av.code(" f()\n{ \n f();  \n}" , {lineNumbers:false , top:0 , left:200});
  av.step();

  // Slide 12
  av.umsg(interpret("av_c12"));
  Pointer2.show(); 
  var  pseudo7 = av.code(" f()\n{ \n f();  \n}" , {lineNumbers:false , top:0 , left:300});
  av.step();

  // Slide 13
  av.umsg(interpret("av_c13"));
  Pointer3.show(); 
  var  pseudo8 = av.code(" f()\n{ \n f(); \n}" , {lineNumbers:false , top:0 , left:400});
  av.step();
 
  // Slide 14
  av.umsg(interpret("av_c14"));
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  Pointer4.show();
  av.step();

  // Slide 15
  av.umsg(interpret("av_c15"));
  Pointer5.show();
  av.step();

  // Slide 16
  av.umsg(interpret("av_c16"));
  Pointer6.show();
  av.recorded();
});