import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class NewReading implements PageObjectInterface
{
    /*
        Page Object for the New Reading page.
    */

    // Public Instance Variables
    public titleInput = element(by.id('readingTitle'));
    public contentInput = element(by.id('readingContent'));
    public sourceInput = element(by.id('readingSource'));
    public groupInput = element(by.id('firstProjectLabel'));
    public addButton = element(by.id('addReadingButton'));
    
    public uploadModalButton = element(by.css('#buttonUploadImage'));
    public imageUploadTrigger = element(by.id('buttonBeginImageUpload'));
    public imageFileInput = element(by.css('#imageFileInput'));
    public uploadedImage = element(by.css(".upload-list-item.new"));

    public imageInReading = element(by.css(".content .img img"));
    // public imageUploadList = element.all(by.css('.upload-list-item'));
    
    public titleError = element(by.id('errorTitle'));
    public contentError = element(by.id('errorContent'));
    public groupError = element(by.id('errorGroupLabel'));

    public titleString = 'Test: Early Beginnings of Robots';
    public titleImageString = 'Test: Image';
    public contentString = 'Many ancient mythologies, and most modern religions include artificial people, such as the mechanical servants built by the Greek god Hephaestus[16] (Vulcan to the Romans), the clay golems of Jewish legend and clay giants of Norse legend, and Galatea, the mythical statue of Pygmalion that came to life. Since circa 400 BC, myths of Crete include Talos, a man of bronze who guarded the Cretan island of Europa from pirates.\nWashstand automaton reconstruction, as described by Philo of Byzantium (Greece, 3rd century BC).\nIn ancient Greece, the Greek engineer Ctesibius (c. 270 BC) "applied a knowledge of pneumatics and hydraulics to produce the first organ and water clocks with moving figures."[17][18] In the 4th century BC, the Greek mathematician Archytas of Tarentum postulated a mechanical steam-operated bird he called "The Pigeon". Hero of Alexandria (10–70 AD), a Greek mathematician and inventor, created numerous user-configurable automated devices, and described machines powered by air pressure, steam and water.[19]\nAl-Jazari\'s toy boat, musical automata\nThe 11th century Lokapannatti tells of how the Buddha\'s relics were protected by mechanical robots (bhuta vahana yanta), from the kingdom of Roma visaya (Rome); until they were disarmed by King Ashoka. [20] [21]\nIn ancient China, the 3rd century text of the Lie Zi describes an account of humanoid automata, involving a much earlier encounter between Chinese emperor King Mu of Zhou and a mechanical engineer known as Yan Shi, an \'artificer\'. Yan Shi proudly presented the king with a life-size, human-shaped figure of his mechanical \'handiwork\' made of leather, wood, and artificial organs.[12] There are also accounts of flying automata in the Han Fei Zi and other texts, which attributes the 5th century BC Mohist philosopher Mozi and his contemporary Lu Ban with the invention of artificial wooden birds (ma yuan) that could successfully fly.[15] In 1066, the Chinese inventor Su Song built a water clock in the form of a tower which featured mechanical figurines which chimed the hours.\nSu Song\'s astronomical clock tower showing the mechanical figurines which chimed the hours.\nThe beginning of automata is associated with the invention of early Su Song\'s astronomical clock tower featured mechanical figurines that chimed the hours.[22][23][24] His mechanism had a programmable drum machine with pegs (cams) that bumped into little levers that operated percussion instruments. The drummer could be made to play different rhythms and different drum patterns by moving the pegs to different locations.[24]\nIn Renaissance Italy, Leonardo da Vinci (1452–1519) sketched plans for a humanoid robot around 1495. Da Vinci\'s notebooks, rediscovered in the 1950s, contained detailed drawings of a mechanical knight now known as Leonardo\'s robot, able to sit up, wave its arms and move its head and jaw.[25] The design was probably based on anatomical research recorded in his Vitruvian Man. It is not known whether he attempted to build it.\nIn Japan, complex animal and human automata were built between the 17th to 19th centuries, with many described in the 18th century Karakuri zui (Illustrated Machinery, 1796). One such automaton was the karakuri ningyō, a mechanized puppet.[26] Different variations of the karakuri existed: the Butai karakuri, which were used in theatre, the Zashiki karakuri, which were small and used in homes, and the Dashi karakuri which were used in religious festivals, where the puppets were used to perform reenactments of traditional myths and legends.\nIn France, between 1738 and 1739, Jacques de Vaucanson exhibited several life-sized automatons: a flute player, a pipe player and a duck. The mechanical duck could flap its wings, crane its neck, and swallow food from the exhibitor\'s hand, and it gave the illusion of digesting its food by excreting matter stored in a hidden compartment.';
    public contentShortString = 'Three Laws of Robotics\nA robot may not injure a human being or, through inaction, allow a human being to come to harm.\nA robot must obey the orders given it by human beings except where such orders would conflict with the First Law.\nA robot must protect its own existence as long as such protection does not conflict with the First or Second Laws.';
    public sourceString = 'https://en.wikipedia.org/wiki/Robot';
    public groupString = 'Test Group 001';

    // get the login page
    getPage() : void 
    {
        browser.get('/#/new-reading');
    } // getPage() : void


} // class Login