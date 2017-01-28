export class Copy {
  private userCopy: any = {
    placeholders: [
      {
        username: "pokemaster",
        fullname: "Ash Catchem",
        email: "ash@catchem.all"
      }, {
        username: "bigdog",
        fullname: "Clifford the Dog",
        email: "clifford@bigred.dog"
      }, {
        username: "spongedude",
        fullname: "Sponge Bob",
        email: "spongebob@bottom.sea"
      }, {
        username: "atomboy",
        fullname: "Jimmy Neutron",
        email: "jimmy@boygenius.edu"
      }, {
        username: "scooby_snack",
        fullname: "Scooby Dooby Doo",
        email: "scooby@mysterymachine.co"
      }, {
        username: "yabbadabbadoo",
        fullname: "Fred Flintstone",
        email: "fred.flinstone@slaterockgravel.co"
      }, {
        username: "spaceman15",
        fullname: "George Jetson",
        email: "george.jetson@spacelyspacesprockets.com"
      }, {
        username: "RespectTheWand",
        fullname: "Wanda Venus Fairywinkle-Cosma",
        email: "wanda@fairygodparents.com"
      }, {
        username: "iExplore",
        fullname: "Dora Márquez",
        email: "dora@explorer.gov"
      }
    ]
  }

  public getUserCopy(): any {
    var index = Math.floor(Math.random() * this.userCopy.placeholders.length - 1);

    return this.userCopy.placeholders[index];
  }
}