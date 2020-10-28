function run() {
    var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    var mainSheetName = "_main";

    var mainColumnFormContentFile = "Form Content File";
    var mainColumnFormConfigFile = "Form Config File";
    var mainColumnActive = "Active";

    var mainTable = Utility.convertSheet2JsonText(spreadSheet, mainSheetName);

    for (var formIndex = 0; formIndex < mainTable.length; formIndex++) {
        var formContentFile = mainTable[formIndex][mainColumnFormContentFile];
        var formConfigFile = mainTable[formIndex][mainColumnFormConfigFile];
        var active = mainTable[formIndex][mainColumnActive] === 1;

        if (active) {
            var xmlContentFile = UrlFetchApp.fetch(formContentFile).getContentText();
            var documentContentFile = XmlService.parse(xmlContentFile);
            var formNode = documentContentFile.getRootElement();

            var xmlConfigFile = UrlFetchApp.fetch(formConfigFile).getContentText();
            var documentConfigFile = XmlService.parse(xmlConfigFile);
            var configNode = documentConfigFile.getRootElement();

            var itemsQueue = [];
            var factory = new Factory();

            factory.createItem(formNode, configNode, itemsQueue);

            if (itemsQueue.length > 0) {
                var formItem = itemsQueue.shift();
                var formName = formItem.name !== undefined ? formItem.name : "";

                var form = FormApp.create(formName);
                formItem.create(form);

                while (itemsQueue.length > 0) {
                    var item = itemsQueue.shift();
                    if (item !== null) {
                        item.create(form);
                    }
                }
            }
        }
    }
}

class Factory {
    createItem(node, configNode, itemsQueue) {
        var item = null;

        switch (node.getName()) {
            case "form-item":
                item = new FormItem(node, configNode);
                break;
            case "section-item":
                item = new SectionItem(node);
                break;
            case "image-item":
                item = new ImageItem(node);
                break;
            case "text-item":
                item = new TextItem(node);
                break;
            case "question-short-answer-item":
                item = new QuestionShortAnswerItem(node, configNode);
                break;
            case "question-multiple-choice-item":
                item = new QuestionMultipleChoiceItem(node);
                break;
            default:
                {
                    return;
                }
        }


        itemsQueue.push(item);

        let that = this;
        node.getChildren().forEach(function(childNode) {
            that.createItem(childNode, configNode, itemsQueue);
        });
    }
}

class FormItem {
    constructor(node, configNode) {
        let configChildNode = configNode.getChild("accepting-responses");
        this.acceptingResponses = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("allow-response-edit");
        this.allowResponseEdit = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("collect-email");
        this.collectEmail = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("confirmation-message");
        this.confirmationMessage = configChildNode !== null ? configChildNode.getText() : "";

        configChildNode = configNode.getChild("custom-closed-form-message");
        this.customClosedFormMessage = configChildNode !== null ? configChildNode.getText() : "";

        configChildNode = configNode.getChild("is-quiz");
        this.isQuiz = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("limit-one-response-per-user");
        this.limitOneResponsePerUser = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("progress-bar");
        this.progressBar = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("publishing-summary");
        this.publishingSummary = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("require-login");
        this.requireLogin = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("show-link-to-respond-again");
        this.showLinkToRespondAgain = configChildNode !== null ? configChildNode.getText() === "true" : true;

        configChildNode = configNode.getChild("shuffle-questions");
        this.shuffleQuestions = configChildNode !== null ? configChildNode.getText() === "true" : true;


        let childNode = node.getChild('name');
        this.name = childNode !== null ? childNode.getText() : "";

        childNode = node.getChild('title');
        this.title = childNode !== null ? childNode.getText() : "";

        childNode = node.getChild('description');
        this.description = childNode !== null ? childNode.getText() : "";
    }

    create(form) {
        form.setConfirmationMessage(this.confirmationMessage)
        form.setAllowResponseEdits(this.allowResponseEdit)
        form.setAcceptingResponses(this.acceptingResponses);
        form.setCollectEmail(this.collectEmail);
        form.setCustomClosedFormMessage(this.customClosedFormMessage);
        form.setIsQuiz(this.isQuiz);
        form.setLimitOneResponsePerUser(this.limitOneResponsePerUser);
        form.setProgressBar(this.progressBar);
        form.setPublishingSummary(this.publishingSummary);
        //form.setRequireLogin(this.requireLogin);
        form.setShowLinkToRespondAgain(this.showLinkToRespondAgain);
        form.setShuffleQuestions(this.shuffleQuestions);

        form.setTitle(this.title);
        form.setDescription(this.description);
    }
}

class SectionItem {
    constructor(node) {
        let childNode = node.getChild('title');
        this.title = childNode !== null ? childNode.getText() : "";

        childNode = node.getChild('description');
        this.description = childNode !== null ? childNode.getText() : "";
    }
    create(form) {
        form.addPageBreakItem().setTitle(this.title).setHelpText(this.description); //add section-item
    }
}

class ImageItem {
    constructor(node) {
        let childNode = node.getChild('title');
        this.title = childNode !== null ? childNode.getText() : "";

        childNode = node.getChild('source');
        this.source = childNode !== null ? childNode.getText() : "";
        this.image = this.source !== "" ? UrlFetchApp.fetch(this.source) : null;
    }

    create(form) {
        let item = form.addImageItem().setTitle(this.title);
        if (this.image !== null) {
            item.setImage(this.image); //add Image
        }
    }
}

class TextItem {
    constructor(node) {
        let childNode = node.getChild('title');
        this.title = childNode !== null ? childNode.getText() : "";

        childNode = node.getChild('description');
        var parNodes = childNode !== null ? childNode.getChildren('p') : null;

        this.description = [];
        if (parNodes !== null) {
            parNodes.forEach(parNode => this.description.push(parNode.getText()));
        }
    }

    create(form) {
        form.addSectionHeaderItem().setTitle(this.title).setHelpText(this.description.join('\n\n')); //add title and description
    }
}

class QuestionShortAnswerItem {
    constructor(node, configNode) {
        let childConfigNode = configNode.getChild("validation-text");
        var validationText = childConfigNode !== null ? childConfigNode.getText() : "";

        let childNode = node.getChild("question");

        this.question = "";
        this.textValidation = null;

        if (childNode !== null) {
            this.question = childNode.getText();
            let attributeNode = childNode.getAttribute("answer");
            var answer = attributeNode !== null ? attributeNode.getValue() : "";
            this.textValidation = FormApp.createTextValidation().setHelpText(validationText).requireTextLengthLessThanOrEqualTo(answer.length).build();
        }
    }
    create(form) {
        form.addTextItem().setTitle(this.question).setPoints(1).setValidation(this.textValidation); //add Short Question    
    }
}

class QuestionMultipleChoiceItem {
    constructor(node) {
        this.optionNodes = node.getChildren('option');
    }
    create(form) {
        var item = form.addCheckboxItem().setTitle("");

        if (this.optionNodes !== null) {
            var choices = [];
            for (var j = 0; j < this.optionNodes.length; j++) {
                var optionNode = this.optionNodes[j];
                var option = optionNode.getText();

                choices.push(item.createChoice(option));
            }

            item.setChoices(choices).setRequired(true);
        }
    }
}