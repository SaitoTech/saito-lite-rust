

 var label = "";
     label = "The Anarchists and the Printing Press";

  //
  // over-rides version is "adso.js" that kicks into admin mode
  //
 function onWordClick() {

   if (tt4 == "" && tt3 == "" && tt2 == "") { return; };

   tmpobj = $('#adso_status');

   tmpobj.html(tt3);
   tmpobj.css('left',rawx-20);
   tmpobj.css('top',rawy);
   tmpobj.css('opacity',1);
   tmpobj.css('display','block');

   tmpobj.animate({
     opacity: 0,
     fontSize: '2em',
     color: '#CCCCCC',
     top: '-=100',
     left: '+=15'
   }, 1500, function() {
   });

   var temptt = tt4; tt4=tt3;tt3=temptt; 

   // do not submit part of speech (field5)
   var submission = "/tools/addVocab?field1="+tt4+"&field2="+tt3+"&field3="+tt2+"&field4="+tt1+"&field5=&label="+label;

 }

