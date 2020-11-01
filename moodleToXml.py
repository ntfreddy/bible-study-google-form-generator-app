import codecs

class IntroElement:
    def __init__(self, lines, lessonNbr):
        self.lines = []
        self.lessonNbr = lessonNbr

        for line in lines: 
            if "Introduction" in line:
                continue
            else:
                self.lines.append(line)

    def create(self):
        outputContent = "  <image-item>\n"
        outputContent += "      <source>https://raw.githubusercontent.com/ntfreddy/bible-study-google-form-generator-app/main/Storacles%20of%20Prophecy/images/" + self.lessonNbr + "/" + self.lessonNbr + "-00.jpg</source>\n"
        outputContent += "      <title></title>\n"
        outputContent += "  </image-item>\n"
        outputContent += "  <text-item>\n"
        outputContent += "      <title>Introduction</title>\n"
        outputContent += "      <description>\n"

        for line in self.lines: 
             outputContent += "         <p>" + line + "</p>\n"
        outputContent += "      </description>\n"
        outputContent += "  </text-item>\n"
        return outputContent

class QuestionShortElement:
    def __init__(self, lines, lessonNbr):
        self.verses = []
        self.notes = []
        self.lessonNbr = lessonNbr
        self.verseDetected = False
        self.noteDetected = False
        self.answer = ""

        for line in lines: 
            if "Question" in line:
                self.questionTitle = line
                questionArray = line.split(' ')
                self.questionNbr = questionArray[1]
                continue            
            if "Answer" in line:
                answerArray = line.split(':')
                self.answer = answerArray[1].strip()
                continue
            if "Note" in line:
                noteArray = line.split('Note : ')
                self.notes.append(noteArray[1].strip())
                self.verseDetected = False
                self.noteDetected = True
                continue
            if(self.noteDetected):
                self.notes.append(line)
                continue
            if(self.verseDetected):
                self.verses.append(line)
                continue
            if self.detectFormQuestion(line):
                self.question = line
                self.verseDetected = True
                continue

    def detectFormQuestion(self, line):
        return len(line) > 0 and line[0].isdigit() and line[len(line) - 1] == '?'
    def create(self):
        outputContent = "  <section-item>\n"
        outputContent += "      <title>" + self.questionTitle + "</title>\n"
        outputContent += "      <image-item>\n"
        outputContent += "          <source>https://raw.githubusercontent.com/ntfreddy/bible-study-google-form-generator-app/main/Storacles%20of%20Prophecy/images/" + self.lessonNbr + "/" + self.lessonNbr + "-" + self.questionNbr.zfill(2) + ".jpg</source>\n"
        outputContent += "          <title>" + self.question + "</title>\n"
        outputContent += "      </image-item>\n"

        if len(self.verses) > 0: 
            outputContent += "      <question-short-answer-item>\n"
            outputContent += "          <question answer='"+ self.answer + "'>" + self.verses[0] + "</question>\n"
            outputContent += "      </question-short-answer-item>\n"

        if len(self.verses) > 1:  
            outputContent += "      <text-item>\n"
            outputContent += "          <title></title>\n"
            outputContent += "          <description>\n"            
            for i in range(len(self.verses)):
                if i > 0:
                    outputContent += "              <p>" + self.verses[i] + "</p>\n"

            outputContent += "          </description>\n"
            outputContent += "      </text-item>\n"   

        if len(self.notes) > 0:            
            outputContent += "      <text-item>\n"
            outputContent += "          <title>Note</title>\n"
            outputContent += "          <description>\n"
            for i in range(len(self.notes)):
                outputContent += "              <p>" + self.notes[i] + "</p>\n"
            outputContent += "          </description>\n"
            outputContent += "      </text-item>\n"
        outputContent += "  </section-item>\n"
        return outputContent

class QuestionMultichoiceElement:
    def __init__(self, lines, lessonNbr):
        self.answers = []
        self.notes = []
        self.lessonNbr = lessonNbr
        self.questionDetected = False
        self.answerDetected = False
        self.noteDetected = False

        for line in lines: 
            if "Question" in line:
                self.questionTitle = line
                questionArray = line.split(' ')
                self.questionNbr = questionArray[1]
                continue
            if self.detectFormQuestion(line):
                self.question = line
                self.questionDetected = True
                continue
            if "Answer" in line:
                self.answerDetected = True
                continue
            if self.answerDetected:
                self.answerDetected = False
                self.answers.append(line)
                continue
                continue
            if "Note" in line:
                noteArray = line.split(':')
                self.notes.append(questionArray[1].strip())
                self.questionDetected = False
                self.noteDetected = True
                continue
            if(self.noteDetected):
                self.notes.append(line)
                continue

    def detectFormQuestion(self, line):
        return len(line) > 0 and line[0].isdigit() and line[len(line) - 1] == '?'
    def create(self):
        outputContent = "  <section-item>\n"
        outputContent += "      <title>" + self.questionTitle + "</title>\n"
        outputContent += "      <image-item>\n"
        outputContent += "          <source>https://raw.githubusercontent.com/ntfreddy/bible-study-google-form-generator-app/main/Storacles%20of%20Prophecy/images/" + self.lessonNbr + "/" + self.lessonNbr + "-" + self.questionNbr.zfill(2) + ".jpg</source>\n"
        outputContent += "          <title></title>\n"
        outputContent += "      </image-item>\n"
        outputContent += "      <question-multiple-choice-item>\n"
        outputContent += "          <question>" + self.question + "</question>\n"
        outputContent += "          <options>\n"
        for answer in self.answers:
            outputContent += "              <option>" + answer + "</option>\n"
        outputContent += "          </options>\n"
        outputContent += "      </question-multiple-choice-item>\n"
        if len(self.notes) > 0:            
            outputContent += "      <text-item>\n"
            outputContent += "          <title>Note</title>\n"
            outputContent += "          <description>\n"
            for i in range(len(self.notes)):
                outputContent += "              <p>" + self.notes[i] + "</p>\n"
            outputContent += "          </description>\n"
            outputContent += "      </text-item>\n"
        outputContent += "  </section-item>\n"
        return outputContent

class InfoElement:
    def __init__(self, lines, lessonNbr):
        self.lessonNbr = lessonNbr

        self.descriptions = []
        self.supplementTitle = ""
        self.infoTitleDetected = False
        self.supplementTitleDetected = False
        self.noteDetected = False

        for line in lines: 
            if "Information" in line:
                self.infoTitleDetected = True
                continue
            if self.infoTitleDetected:
                self.supplementTitle = line
                self.infoTitleDetected = False
                self.supplementTitleDetected = True
                continue
            if self.supplementTitleDetected:
                self.descriptions.append(line)
                continue

    def create(self):
        outputContent = "  <section-item>\n"
        outputContent += "  <title>Informations complémentaires</title>\n"
        outputContent += "  <image-item>\n"
        outputContent += "      <title>" + self.supplementTitle + "</title>\n"
        outputContent += "      <source>https://raw.githubusercontent.com/ntfreddy/bible-study-google-form-generator-app/main/Storacles%20of%20Prophecy/images/" + self.lessonNbr + "/" + self.lessonNbr + "-sp.jpg</source>\n"
        outputContent += "  </image-item>\n"
        outputContent += "  <text-item>\n"
        outputContent += "      <description>\n"
        outputContent += "          <p>" + "\n".join(self.descriptions) + "</p>\n"
        outputContent += "      </description>\n"
        outputContent += "  </text-item>\n"
        outputContent += "</section-item>\n"
        return outputContent

class FormElement:
    def __init__(self, lines):
        self.elements = []
        self.lines = []
        self.forbiddenWords = [
            "Preview",
            "Edit",
            "Reports",
            "Grade essays",
            "Collapsed",
            "Expanded",
            "cluster",
            "24 études bibliques prophétiques",
            "Content",
            "Jump",
            "Short answer",
            "Response",
            "Bonne réponse",
            "Score",
            "Essayez encore",
            "wronganswer",
            "Multichoice"
        ]
        self.childrenMap = {}

        self.formTitleDetected = False
        self.formIntroductionDetected = False
        self.formQuestionDetected = False
        self.formInfoDetected = False

        for line in lines: 
            trimmedLine = line.strip();
            removeLine = False
            for forbiddenWord in self.forbiddenWords:
                if forbiddenWord in trimmedLine: 
                    removeLine = True
                    break
            if len(trimmedLine) == 0:
                removeLine = True
            if not removeLine:
                self.lines.append(trimmedLine + "\n")
                if not self.formTitleDetected and self.detectFormTitle(trimmedLine):
                    titleArray1 = trimmedLine.split(' - ')
                    titleArray2 = titleArray1[0].split('.')
                    self.name = titleArray1[0].strip()
                    self.formVerse = titleArray1[1].strip()  
                    self.lessonNbr = titleArray2[0].strip()
                    self.formTitle = titleArray2[1].strip()
                    self.lessonWord = "lesson" + self.lessonNbr

                    # add form title to lines to be removed
                    self.forbiddenWords.append(self.formTitle)
                    self.formTitleDetected = True
                    continue
                if self.detectFormIntro(trimmedLine):
                    self.formIntroductionDetected = True
                    self.childrenMap["intro"] = [trimmedLine]
                    continue
                if self.detectFormQuestion(trimmedLine):
                    if self.formIntroductionDetected:
                        self.elements.append(IntroElement(self.childrenMap["intro"], self.lessonWord))
                    else:
                        self.elements.append(QuestionShortElement(self.childrenMap["question"], self.lessonWord))
                    self.formIntroductionDetected = False
                    self.formQuestionDetected = True
                    self.childrenMap["question"] = [trimmedLine]
                    continue
                if(self.detectFormInfo(trimmedLine)):
                    if self.formQuestionDetected:
                        self.elements.append(QuestionMultichoiceElement(self.childrenMap["question"], self.lessonWord))
                    self.formIntroductionDetected = False
                    self.formQuestionDetected = False
                    self.formInfoDetected = True
                    self.childrenMap["info"] = [trimmedLine]
                    continue
                if(self.formIntroductionDetected):
                    self.childrenMap["intro"].append(trimmedLine)
                    continue
                if(self.formQuestionDetected):
                    self.childrenMap["question"].append(trimmedLine)
                    continue
                if(self.formInfoDetected):
                    self.childrenMap["info"].append(trimmedLine)
                    continue
        if self.formInfoDetected:
            self.elements.append(InfoElement(self.childrenMap["info"], self.lessonWord))
                
        outputDataFile = "./Storacles of Prophecy/content/fr/forms/lesson" + self.lessonNbr + ".txt"
        with open(file=outputDataFile, mode="w",encoding="utf-8") as outputDataStream:
            outputDataStream.writelines(self.lines) 
    def detectFormTitle(self, line):
        if len(line) > 0 and line[0].isdigit() and line[len(line) - 1].isdigit():
            return True
        else:
            return False
    def detectFormIntro(self, line):
        return "Introduction" in line

    def detectFormQuestion(self, line):
        return "Question" in line

    def detectFormInfo(self, line):
        return "Information" in line

    def create(self, slot):
        outputContent = "<?xml version='1.0' encoding='UTF-8'?>\n"
        outputContent += "<form-item>\n"
        outputContent += "  <name>" + self.name + "</name>\n"
        outputContent += "  <title>Étude biblique leçon " + str(int(self.lessonNbr)) + " - " + self.formTitle + "</title>\n"
        outputContent += "  <description>" + self.formVerse + "</description>\n"        
        outputContent += slot
        outputContent += "</form-item>\n"
        return outputContent


class Facade:
    def __init__(self, strNbr):
        self.linesInput = []
 
        self.strNbr = strNbr
        self.inputFile = "./Storacles of Prophecy/content/fr/moodle/lesson" + self.strNbr + ".txt"

        self.outputXmlFile = "./Storacles of Prophecy/content/fr/forms/lesson" + self.strNbr + ".xml"
    def createXml(self):
        print("Starting ...")
        with open(file=self.inputFile, mode="r",encoding="utf-8") as inputStream:
            self.linesInput  = inputStream.readlines()


        formElement = FormElement(self.linesInput)

        slot = ""
        for element in formElement.elements:
            slot += element.create()            

        outputContent = formElement.create(slot)

        with open(file=self.outputXmlFile, mode="w",encoding="utf-8") as outputXmlStream:
            outputXmlStream.write(outputContent)

for i in [13]:
    facade = Facade(str(i).zfill(2))
    facade.createXml();


print("Finished")
