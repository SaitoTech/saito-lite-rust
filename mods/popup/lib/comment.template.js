module.exports = (lesson) => {
	return `
     <div class="lesson-container">

       <div class="lesson-introduction">${lesson.intro}</div>
       <div class="lesson-text">
<div id="lesson_dialogue">
<table>

  <tbody><tr class="lesson_sentence">
        <td class="lesson_sentence_player">
            <img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/text/rec-1404805557826-text-1.mp3',this);">
          </td>
    <td class="lesson_sentence_speaker">
      <span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'A','Jia3','甲','甲','','5')" onmouseout="htip()">甲</span>    </td>
        <td class="lesson_sentence_data">
      <div class="lesson_sentence_source" id="lesson_sentence_source_7972">
	<span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'hey','ai1','哎','哎','','5')" onmouseout="htip()">哎</span><span id="adso_9" onclick="onWordClick()" onmousedown="adso_mousedown('9')" onmouseup="adso_mouseup('9')" onmouseover="tip(event,', ','，','，','，','','9')" onmouseout="htip()">，</span><span id="adso_13" onclick="onWordClick()" onmousedown="adso_mousedown('13')" onmouseup="adso_mouseup('13')" onmouseover="tip(event,'your','ni3','你','你','','13')" onmouseout="htip()">你</span><span id="adso_17" onclick="onWordClick()" onmousedown="adso_mousedown('17')" onmouseup="adso_mouseup('17')" onmouseover="tip(event,'leg','tui3','腿','腿','','17')" onmouseout="htip()">腿</span><span id="adso_24" onclick="onWordClick()" onmousedown="adso_mousedown('24')" onmouseup="adso_mouseup('24')" onmouseover="tip(event,'how','zen3me5','怎么','怎麼','','24')" onmouseout="htip()">怎么</span><span id="adso_28" onclick="onWordClick()" onmousedown="adso_mousedown('28')" onmouseup="adso_mouseup('28')" onmouseover="tip(event,'to be bruised','qing1 le5','青了','青了','note: 了 is added here as it indicates that something has changed. The bruise has appeared.','28')" onmouseout="htip()">青了</span><span id="adso_36" onclick="onWordClick()" onmousedown="adso_mousedown('36')" onmouseup="adso_mouseup('36')" onmouseover="tip(event,'? ','？','？','？','','36')" onmouseout="htip()">？</span>      </div>
	      <div class="lesson_sentence_pinyin">
        āi ， nǐ tuǐ zěnme qīng le ？       </div>
      <div class="lesson_sentence_trans">
        Hey, why is your leg bruised?      </div>
	    </td>
  </tr>

  <tr class="lesson_sentence">
        <td class="lesson_sentence_player">
            <img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/text/rec-1404805557826-text-2.mp3',this);">
          </td>
    <td class="lesson_sentence_speaker">
      <span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'B','Yi3','乙','乙','','5')" onmouseout="htip()">乙</span>    </td>
        <td class="lesson_sentence_data">
      <div class="lesson_sentence_source" id="lesson_sentence_source_7973">
	<span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'to be at','zai4','在','在','unknown','5')" onmouseout="htip()">在</span><span id="adso_12" onclick="onWordClick()" onmousedown="adso_mousedown('12')" onmouseup="adso_mouseup('12')" onmouseover="tip(event,'where','na3r5','哪儿','哪兒','','12')" onmouseout="htip()">哪儿</span><span id="adso_16" onclick="onWordClick()" onmousedown="adso_mousedown('16')" onmouseup="adso_mouseup('16')" onmouseover="tip(event,'? ','？','？','？','','16')" onmouseout="htip()">？</span>      </div>
	      <div class="lesson_sentence_pinyin">
        zài nǎr ？       </div>
      <div class="lesson_sentence_trans">
        Where?      </div>
	    </td>
  </tr>

  <tr class="lesson_sentence">
        <td class="lesson_sentence_player">
            <img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/text/rec-1404805557826-text-3.mp3',this);">
          </td>
    <td class="lesson_sentence_speaker">
      <span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'A','Jia3','甲','甲','','5')" onmouseout="htip()">甲</span>    </td>
        <td class="lesson_sentence_data">
      <div class="lesson_sentence_source" id="lesson_sentence_source_7974">
	<span id="adso_8" onclick="onWordClick()" onmousedown="adso_mousedown('8')" onmouseup="adso_mouseup('8')" onmouseover="tip(event,'knee','xi1gai4','膝盖','膝蓋','','8')" onmouseout="htip()">膝盖</span><span id="adso_12" onclick="onWordClick()" onmousedown="adso_mousedown('12')" onmouseup="adso_mouseup('12')" onmouseover="tip(event,'on','shang4','上','上','unknown','12')" onmouseout="htip()">上</span><span id="adso_16" onclick="onWordClick()" onmousedown="adso_mousedown('16')" onmouseup="adso_mouseup('16')" onmouseover="tip(event,'. ','。','。','。','','16')" onmouseout="htip()">。</span>      </div>
	      <div class="lesson_sentence_pinyin">
        xīgài shàng 。       </div>
      <div class="lesson_sentence_trans">
        On the knee.      </div>
	    </td>
  </tr>

  <tr class="lesson_sentence">
        <td class="lesson_sentence_player">
            <img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/text/rec-1404805557826-text-4.mp3',this);">
          </td>
    <td class="lesson_sentence_speaker">
      <span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'B','Yi3','乙','乙','','5')" onmouseout="htip()">乙</span>    </td>
        <td class="lesson_sentence_data">
      <div class="lesson_sentence_source" id="lesson_sentence_source_7975">
	<span id="adso_5" onclick="onWordClick()" onmousedown="adso_mousedown('5')" onmouseup="adso_mouseup('5')" onmouseover="tip(event,'oh','o4','哦','哦','','5')" onmouseout="htip()">哦</span><span id="adso_9" onclick="onWordClick()" onmousedown="adso_mousedown('9')" onmouseup="adso_mouseup('9')" onmouseover="tip(event,', ','，','，','，','','9')" onmouseout="htip()">，</span><span id="adso_16" onclick="onWordClick()" onmousedown="adso_mousedown('16')" onmouseup="adso_mouseup('16')" onmouseover="tip(event,'yesterday','zuo2tian1','昨天','昨天','','16')" onmouseout="htip()">昨天</span><span id="adso_20" onclick="onWordClick()" onmousedown="adso_mousedown('20')" onmouseup="adso_mouseup('20')" onmouseover="tip(event,'to fall','shuai1','摔','摔','','20')" onmouseout="htip()">摔</span><span id="adso_24" onclick="onWordClick()" onmousedown="adso_mousedown('24')" onmouseup="adso_mouseup('24')" onmouseover="tip(event,'(nominalizing)','de5','的','的','my wounded knee was from falling yesterday, this works with 摔 to create a compound that works as a noun. There is an implied 是 in the sentence. 是昨天摔的.','24')" onmouseout="htip()">的</span><span id="adso_28" onclick="onWordClick()" onmousedown="adso_mousedown('28')" onmouseup="adso_mouseup('28')" onmouseover="tip(event,'. ','。','。','。','','28')" onmouseout="htip()">。</span>      </div>
	      <div class="lesson_sentence_pinyin">
        ò ， zuótiān shuāi de 。       </div>
      <div class="lesson_sentence_trans">
        Oh，I fell yesterday.      </div>
	    </td>
  </tr>
</tbody></table>
</div>
       </div>

       <div class="lesson-vocabulary">
<table class="lesson_word">
    <tbody><tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-12.mp3',this);"></td>
        <td class="lesson_word_field1">头</td>
    <td class="lesson_word_field2">頭</td>
    <td class="lesson_word_field3">tóu</td>
    <td class="lesson_word_field4">head</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-13.mp3',this);"></td>
        <td class="lesson_word_field1">腿</td>
    <td class="lesson_word_field2">腿</td>
    <td class="lesson_word_field3">tuǐ</td>
    <td class="lesson_word_field4">leg</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-14.mp3',this);"></td>
        <td class="lesson_word_field1">胳膊</td>
    <td class="lesson_word_field2">胳膊</td>
    <td class="lesson_word_field3">gēbo</td>
    <td class="lesson_word_field4">arm</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-15.mp3',this);"></td>
        <td class="lesson_word_field1">肚子</td>
    <td class="lesson_word_field2">肚子</td>
    <td class="lesson_word_field3">dùzi</td>
    <td class="lesson_word_field4">stomach</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-16.mp3',this);"></td>
        <td class="lesson_word_field1">膝盖</td>
    <td class="lesson_word_field2">膝蓋</td>
    <td class="lesson_word_field3">xīgài</td>
    <td class="lesson_word_field4">knee</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-17.mp3',this);"></td>
        <td class="lesson_word_field1">疼</td>
    <td class="lesson_word_field2">疼</td>
    <td class="lesson_word_field3">téng</td>
    <td class="lesson_word_field4">painful</td>
    <td class="lesson_word_field5">adjective</td>
  </tr>
    <tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-18.mp3',this);"></td>
        <td class="lesson_word_field1">青</td>
    <td class="lesson_word_field2">青</td>
    <td class="lesson_word_field3">qīng</td>
    <td class="lesson_word_field4">bruised</td>
    <td class="lesson_word_field5">adjective</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-19.mp3',this);"></td>
        <td class="lesson_word_field1">麻</td>
    <td class="lesson_word_field2">麻</td>
    <td class="lesson_word_field3">má</td>
    <td class="lesson_word_field4">numb</td>
    <td class="lesson_word_field5">adjective</td>
  </tr>
    <tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-20.mp3',this);"></td>
        <td class="lesson_word_field1">摔</td>
    <td class="lesson_word_field2">摔</td>
    <td class="lesson_word_field3">shuāi</td>
    <td class="lesson_word_field4">to slip</td>
    <td class="lesson_word_field5">verb</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-21.mp3',this);"></td>
        <td class="lesson_word_field1">哪儿</td>
    <td class="lesson_word_field2">哪兒</td>
    <td class="lesson_word_field3">nǎr</td>
    <td class="lesson_word_field4">where</td>
    <td class="lesson_word_field5">question</td>
  </tr>
    <tr class="lesson_word_row even">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404805557826-vocab-22.mp3',this);"></td>
        <td class="lesson_word_field1">昨天</td>
    <td class="lesson_word_field2">昨天</td>
    <td class="lesson_word_field3">zuótiān</td>
    <td class="lesson_word_field4">yesterday</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
    <tr class="lesson_word_row odd">
        <td class="lesson_word_player"><img src="/img/buttons/play_button.gif" onclick="playWordAudio('http://popupchinese.com/data/1377/mp3/vocab/rec-1404809032897-vocab-24.mp3',this);"></td>
        <td class="lesson_word_field1">锤子</td>
    <td class="lesson_word_field2">錘子</td>
    <td class="lesson_word_field3">chuízi</td>
    <td class="lesson_word_field4">hammer</td>
    <td class="lesson_word_field5">noun</td>
  </tr>
</tbody></table>

       </div>

       <div class="lesson-discussion">
<div id="comment_container" class="comment_container"> <a id="comment-15355" name="comment-15355"> </a><div id="comment_15355" class="comment even"><a id="comment-15355" name="comment-15355"> </a><div class="comment_userline"><a id="comment-15355" name="comment-15355"> <span style="float:right">   <img onclick="delete_comment('15355')" src="/img/icons/trash.gif" alt="delete commenta">  </span> </a><div class="comment_username"><a id="comment-15355" name="comment-15355"> </a><a class="nonlink" href="/lessons/joecosgrove">joecosgrove</a> </div> &nbsp;said on <div class="comment_datetime">March 21, 2018</div> <div id="comment_text_15355" class="comment_text"> I enjoyed this lesson even if nobody else has anything about it yet! </div> </div> </div>  
 <a id="comment-15379" name="comment-15379"> </a><div id="comment_15379" class="comment odd"><a id="comment-15379" name="comment-15379"> </a><div class="comment_userline"><a id="comment-15379" name="comment-15379"> <span style="float:right">   <img onclick="delete_comment('15379')" src="/img/icons/trash.gif" alt="delete commenta">  </span> </a><div class="comment_username"><a id="comment-15379" name="comment-15379"> </a><a class="nonlink" href="/lessons/alexkogo17">alexkogo17</a> </div> &nbsp;said on <div class="comment_datetime">June 9, 2018</div> <div id="comment_text_15379" class="comment_text"> Loved this lesson ❤❤ </div> </div> </div>  
 <a id="comment-15988" name="comment-15988"> </a><div id="comment_15988" class="comment even"><a id="comment-15988" name="comment-15988"> </a><div class="comment_userline"><a id="comment-15988" name="comment-15988"> <span style="float:right">   <img onclick="delete_comment('15988')" src="/img/icons/trash.gif" alt="delete commenta">  </span> </a><div class="comment_username"><a id="comment-15988" name="comment-15988"> </a><a class="nonlink" href="/lessons/ben-irving">ben-irving</a> </div> &nbsp;said on <div class="comment_datetime">March 13, 2020</div> <div id="comment_text_15988" class="comment_text"> I see you used "shuai" for "hurt" here however, if this means "slip" can you only use it as a verb to mean "hurt" if you hurt it by slipping and falling?<p></p>I'm wondering how you would say "I hurt my leg" (ie. in a general sense - for example, maybe you were walking and hit your leg on a table)? Can "teng" or "tong" be a verb as well as an adjective, or would you use something like "shang"? Any help would be super helpful :) </div> </div> </div>  
</div>
       </div>


       <div class="lesson-other-stuff">
Lesson Vocabulary Goes Here
       </div>


     </div>
     <div class="lesson-sidebar">

<img id="podcast_photo" src="/data/1449/image.jpg" class="podcast_photo">
 <audio controls="" style="margin-top:5px">
  <source src="http://popupchinese.com/data/1449/audio.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio> 
 
     </div>

  </div>


   `;
};
