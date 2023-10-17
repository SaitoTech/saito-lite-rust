/*
 *
 * Copyright (c) 2000-2020 by Rodney Kinney, Brian Reynolds, VASSAL
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Library General Public
 * License (LGPL) as published by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Library General Public License for more details.
 *
 * You should have received a copy of the GNU Library General Public
 * License along with this library; if not, copies are available
 * at http://www.opensource.org.
 */
package PathsOfGlory;

import VASSAL.build.Buildable;
import VASSAL.build.GameModule;
import VASSAL.command.CommandEncoder;
import VASSAL.configure.ColorConfigurer;
import VASSAL.i18n.Resources;
import VASSAL.preferences.Prefs;
import java.awt.Color;
import java.awt.Font;

/**
 * A tight mini-mod of the VASSAL 3.4 Chatter, to assign chat colors based on which side players are playing (rather than
 * on whether the text is from "me" or "the other player"). This would all work better if we actually passed real player
 * info with the chat commands when sending from machine to machine, but as we presently don't this will have to do!
 */
public class POGChatter extends VASSAL.build.module.Chatter implements CommandEncoder, Buildable {

  protected static final String AP_CHAT_COLOR = "PoGAPChatColor";
  protected static final String CP_CHAT_COLOR = "PoGCPChatColor";
  Color apChat, cpChat;

  /**
   * Styles a chat message based on the player who sent it.
   * Overrides VASSAL's standard "my machine" / "other machine" logic with a way to assign the CP "grey" color to whoever
   * is playing CP, and the AP "blue" color to whoever is playing AP. And green to a Ref.
   */
  protected String getChatStyle(String s) {
    String style;

    if (s.startsWith(formatChat("").trim())) { //$NON-NLS-1$
      if (GameModule.getGameModule().getProperty(VASSAL.build.module.GlobalOptions.PLAYER_SIDE).equals("Central Powers")) {
        style = "cpchat";
      } else if (GameModule.getGameModule().getProperty(VASSAL.build.module.GlobalOptions.PLAYER_SIDE).equals("Solitaire")) {
        style = "ref";
      } else {
        style = "apchat";
      }

      final String ss = s.toLowerCase();
      if (ss.contains("@cp")) {  //BR// A way to have explicit color chat messages in narrated playbacks.
        style = "cpchat";
      } else if (ss.contains("@ap")) {
        style = "apchat";
      } else if (ss.contains("@ref")) {
        style = "ref";
      }
    } else {
      if (GameModule.getGameModule().getProperty(VASSAL.build.module.GlobalOptions.PLAYER_SIDE).equals("Central Powers")) {
        style = "apchat";
      } else if (GameModule.getGameModule().getProperty(VASSAL.build.module.GlobalOptions.PLAYER_SIDE).equals("Solitaire") || GameModule.getGameModule().getProperty(VASSAL.build.module.GlobalOptions.PLAYER_SIDE).equals("<observer>")) {
        style = "ref";
      } else {
        style = "cpchat";
      }
    }

    return style;
  }

  /**
   * Adds our two player color styles to the HTML stylesheet
   */
  protected void makeStyleSheet(Font f) {
    super.makeStyleSheet(f); // Let VASSAL's chatter build its normal stylesheet

    if (style == null) {
      return;
    }

    addStyle(".apchat", myFont, apChat, "bold", 0);
    addStyle(".cpchat", myFont, cpChat, "bold", 0);
    addStyle(".ref",    myFont, gameMsg2, "bold", 0);
  }

  /**
   * Add two extra color preferences, one for each player side
   */
  @Override
  public void addTo(Buildable b) {
    super.addTo(b); // Let VASSAL's chatter do its normal thing

    GameModule mod = (GameModule) b;
    final Prefs globalPrefs = Prefs.getGlobalPrefs();

    final ColorConfigurer myChatColor = new ColorConfigurer(
      AP_CHAT_COLOR,
      Resources.getString("Paths of Glory - AP Chat Color"),
      new Color(9, 32, 229));

    myChatColor.addPropertyChangeListener(e -> {
      apChat = (Color) e.getNewValue();
      makeStyleSheet(null);
    });

    globalPrefs.addOption(Resources.getString("Chatter.chat_window"), myChatColor);

    apChat = (Color) globalPrefs.getValue(AP_CHAT_COLOR);


    final ColorConfigurer otherChatColor = new ColorConfigurer(CP_CHAT_COLOR,
                                                                Resources.getString("Paths of Glory - CP Chat Color"), new Color (75, 75, 75));

    otherChatColor.addPropertyChangeListener(e -> {
      cpChat = (Color) e.getNewValue();
      makeStyleSheet(null);
    });

    globalPrefs.addOption(Resources.getString("Chatter.chat_window"), otherChatColor);
    cpChat = (Color) globalPrefs.getValue(CP_CHAT_COLOR);

    makeStyleSheet(null);
  }
}
