function myFunction() {
 
    //Load confuguration data
    var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    var mainSheetName = "_main";
    
    var mainColumnFormName = "Form Name";
    var mainColumnFormContentFile = "Form Content File";
    var mainColumnFormConfigFile = "Form Config File";
    
    var mainTable = Utility.convertSheet2JsonText(spreadSheet,mainSheetName);
    
    for(var i = 0;i < mainTable.length;i++) {
      var formName = mainTable[i][mainColumnFormName];
      var formContentFile = mainTable[i][mainColumnFormContentFile];
      var formConfigFile = mainTable[i][mainColumnFormConfigFile];
      
      var xmlContentFile = UrlFetchApp.fetch(formContentFile).getContentText();
      var documentContentFile = XmlService.parse(xmlContentFile);
      var lessonNode = documentContentFile.getRootElement();
      
      var xmlConfigFile = UrlFetchApp.fetch(formConfigFile).getContentText();
      var documentConfigFile = XmlService.parse(xmlConfigFile);
      var configNode = documentConfigFile.getRootElement();
      
      
      var acceptingResponses = configNode.getChild("accepting-responses").getText() === "true";
      var allowResponseEdit = configNode.getChild("allow-response-edit").getText() === "true";
      var allowResponseEdit = configNode.getChild("allow-response-edit").getText() === "true";
      var collectEmail = configNode.getChild("collect-email").getText() === "true";    
      var confirmationMessage = configNode.getChild("confirmation-message").getText();
      var customClosedFormMessage = configNode.getChild("custom-closed-form-message").getText();
      var isQuiz = configNode.getChild("is-quiz").getText() === "true";
      var limitOneResponsePerUser = configNode.getChild("limit-one-response-per-user").getText() === "true";
      var progressBar = configNode.getChild("progress-bar").getText() === "true";    
      var publishingSummary = configNode.getChild("publishing-summary").getText() === "true";
      var requireLogin = configNode.getChild("require-login").getText() === "true";
      var showLinkToRespondAgain = configNode.getChild("show-link-to-respond-again").getText() === "true";
      var shuffleQuestions = configNode.getChild("shuffle-questions").getText() === "true";
      
      var introductionTitle = configNode.getChild("introduction-title").getText();
      var questionTitle = configNode.getChild("question-title").getText();
      var noteTitle = configNode.getChild("note-title").getText();
      var validationText = configNode.getChild("validation-text").getText();
      var infoTitle = configNode.getChild("info-title").getText();
      
      var form = FormApp.create(formName);
      
      var introNode = lessonNode.getChild('intro');
      var introTitle = introNode.getChild('title').getText();
      var introVerse = introNode.getChild('verse').getText();
      var introImageUrl = introNode.getChild('image').getText();  
      var introImage = UrlFetchApp.fetch(introImageUrl);
      
      var introTextBlockNode = introNode.getChild('text-block');
      var introTextBlockTitle = introTextBlockNode.getChild('title').getText();
      var introTextBlockParagraphNodes = introTextBlockNode.getChildren("p");
      
      var introTextBlockParagraphs = [];
      introTextBlockParagraphNodes.forEach(introTextBlockParagraphNode => introTextBlockParagraphs.push(introTextBlockParagraphNode.getText()));
      
      
      //set forms global settings
      form.setConfirmationMessage(confirmationMessage)
      form.setAllowResponseEdits(allowResponseEdit)
      form.setAcceptingResponses(acceptingResponses);
      form.setCollectEmail(collectEmail);
      form.setCustomClosedFormMessage(customClosedFormMessage);
      form.setIsQuiz(isQuiz);
      form.setLimitOneResponsePerUser(limitOneResponsePerUser);
      form.setProgressBar(progressBar);
      form.setPublishingSummary(publishingSummary);
      //form.setRequireLogin(requireLogin);
      form.setShowLinkToRespondAgain(showLinkToRespondAgain);
      form.setShuffleQuestions(shuffleQuestions);
          
      form.setTitle(introTitle); 
      form.setDescription(introVerse); 
      
      form.addImageItem().setTitle('').setImage(introImage);//add Image
      form.addSectionHeaderItem().setTitle(introductionTitle).setHelpText(introTextBlockParagraphs.join('\n\n'));    //add Title and Description
          
      var shortQuestionNodes = Utility.getChildrenByAttribute(lessonNode, "type", "short");
      
      for(var i = 0;i < shortQuestionNodes.length;i++) 
      {
        var shortQuestionNode = shortQuestionNodes[i];
        
        var shortQuestionImageUrl = shortQuestionNode.getChild('image').getText();  
        var shortQuestionImage = UrlFetchApp.fetch(shortQuestionImageUrl);      
        
        var shortQuestionTitle = shortQuestionNode.getChild('title').getText();
        
        form.addPageBreakItem().setTitle(questionTitle + " " + (i + 1)); //add Section
        form.addImageItem().setTitle("" + (i + 1) + ". " + shortQuestionTitle).setImage(shortQuestionImage);
        
              
        var shortQuestionVersesNode = shortQuestionNode.getChild('verses');
        
        if(shortQuestionVersesNode) {
          var shortQuestionVersesNodes = shortQuestionVersesNode.getChildren('verse');   
          
          var shortQuestionVerses = [];
          for(var j = 0;j < shortQuestionVersesNodes.length;j++) 
          {
            var shortQuestionVerseNode = shortQuestionVersesNodes[j];
            var verse = shortQuestionVerseNode.getText();
            
            if(j === 0) { //main verse
              var answer =  shortQuestionVerseNode.getAttribute("answer").getValue();
              var textValidation = FormApp.createTextValidation().setHelpText(validationText).requireTextLengthLessThanOrEqualTo(answer.length).build();
              form.addTextItem().setTitle(verse).setPoints(1).setValidation(textValidation);   //add Short Question       
            }
            else {
              shortQuestionVerses.push(verse);
            }
          }
          
          //other verses
          if(shortQuestionVerses.length > 0) {
            form.addSectionHeaderItem().setTitle("").setHelpText(shortQuestionVerses.join('\n\n'));  //add Remainder verses Title and Description 
          }
        }
        //question notes
        var shortQuestionParagraphs = [];
        var shortQuestionNoteNode = shortQuestionNode.getChild('note');
        if(shortQuestionNoteNode) {
          var shortQuestionParagraphsNodes = shortQuestionNoteNode.getChildren('p');
          shortQuestionParagraphsNodes.forEach(shortQuestionParagraphsNode => shortQuestionParagraphs.push(shortQuestionParagraphsNode.getText()));      
        
          form.addSectionHeaderItem().setTitle(noteTitle).setHelpText(shortQuestionParagraphs.join('\n')); //add Note Title and Description
        }
      }    
      
      var multiChoiceQuestionNodes = Utility.getChildrenByAttribute(lessonNode, "type", "multichoice");
      
      for(var i = 0;i < multiChoiceQuestionNodes.length;i++) 
      {
        var multiChoiceQuestionNode = multiChoiceQuestionNodes[i];
        
        var multiChoiceQuestionImageUrl = multiChoiceQuestionNode.getChild('image').getText();  
        var multiChoiceQuestionImage = UrlFetchApp.fetch(multiChoiceQuestionImageUrl);      
        
        var multiChoiceQuestionTitle = multiChoiceQuestionNode.getChild('title').getText();      
        
        form.addPageBreakItem().setTitle(questionTitle + " " + (i + shortQuestionNodes.length)); //add Section
        form.addImageItem().setTitle("" + (i + 1) + ". " + multiChoiceQuestionTitle).setImage(multiChoiceQuestionImage);
        
        //multichoice       
        var multiChoiceQuestionOptionsNode = multiChoiceQuestionNode.getChild('options');
        if(multiChoiceQuestionOptionsNode) {
          var multiChoiceQuestionOptionsNodes = multiChoiceQuestionOptionsNode.getChildren('option');
          
          var item = form.addCheckboxItem().setTitle("");
          
          var multiChoiceQuestionOptions = [];
          for(var j = 0;j < multiChoiceQuestionOptionsNodes.length;j++) 
          {
            var multiChoiceQuestionOptionNode = multiChoiceQuestionOptionsNodes[j];
            var option = multiChoiceQuestionOptionNode.getText();
            
            multiChoiceQuestionOptions.push(item.createChoice(option));
          }
          
          item.setChoices(multiChoiceQuestionOptions).setRequired(true);
        }
        
        //multichoice note
        var multiChoiceQuestionParagraphs = [];      
        var multiChoiceQuestionNoteNode = multiChoiceQuestionNode.getChild('note');      
        
        if(multiChoiceQuestionNoteNode) {        
          var multiChoiceQuestionParagraphsNodes = multiChoiceQuestionNoteNode.getChildren('p');
          multiChoiceQuestionParagraphsNodes.forEach(multiChoiceQuestionParagraphsNode => multiChoiceQuestionParagraphs.push(multiChoiceQuestionParagraphsNode.getText()));
    
          form.addSectionHeaderItem().setTitle(noteTitle).setHelpText(multiChoiceQuestionParagraphs.join('\n\n')); //add Note Title and Description
        }
      }   
      
      var infoNode = lessonNode.getChild('info');
      var infoLocalTitle = infoNode.getChild('title').getText();
      var infoImageUrl = infoNode.getChild('image').getText();  
      var infoImage = UrlFetchApp.fetch(infoImageUrl);
      
        
        form.addPageBreakItem().setTitle(infoTitle); //add Section
        form.addImageItem().setTitle(infoLocalTitle).setImage(infoImage);
      
      //info paragraphs
       var infoParagraphs = [];
      var infoParagraphsNodes = infoNode.getChildren('p');
        
      if(infoParagraphsNodes){
        infoParagraphsNodes.forEach(infoParagraphsNode => infoParagraphs.push(infoParagraphsNode.getText()));
        
        form.addSectionHeaderItem().setTitle("").setHelpText(infoParagraphs.join('\n\n')); //add Info Paragraphs  
      }
    }
  }
  