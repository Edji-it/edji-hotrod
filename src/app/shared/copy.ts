export class Copy {
  private userCopy: { placeholders: CopyUser[] } = {
    placeholders: [
      {
        username: 'pokemaster',
        fullname: 'Ash Ketchum',
        firstname: 'Ash',
        lastname: 'Ketchum',
        email: 'ash@ketchum.all',
      },
      {
        username: 'spongedude',
        fullname: 'Spongebob Squarepants',
        firstname: 'Spongebob',
        lastname: 'Squarepants',
        email: 'spongebob@bottom.sea',
      },
      {
        username: 'atomboy',
        fullname: 'Jimmy Neutron',
        firstname: 'Jimmy',
        lastname: 'Neutron',
        email: 'jimmy@boygenius.edu',
      },
      {
        username: 'scooby_snack',
        fullname: 'Scooby Dooby Doo',
        firstname: 'Scooby',
        lastname: 'Doo',
        email: 'scooby@mysterymachine.co',
      },
      {
        username: 'yabbadabbadoo',
        fullname: 'Fred Flintstone',
        firstname: 'Fred',
        lastname: 'Flintstone',
        email: 'fred.flinstone@slaterockgravel.co',
      },
      {
        username: 'spaceman15',
        fullname: 'George Jetson',
        firstname: 'George',
        lastname: 'Jetson',
        email: 'george.jetson@spacelyspacesprockets.com',
      },
      {
        username: 'RespectTheWand',
        fullname: 'Wanda Venus Fairywinkle-Cosma',
        firstname: 'Wanda',
        lastname: 'Fairywinkle-Cosma',
        email: 'wanda@fairygodparents.com',
      },
      {
        username: 'iExplore',
        fullname: 'Dora Márquez',
        firstname: 'Dora',
        lastname: 'Márquez',
        email: 'dora@explorer.gov',
      },
      {
        username: 'PoorRichard',
        fullname: 'Benjamin Franklin',
        firstname: 'Benjamin',
        lastname: 'Franklin',
        email: 'ben@whitehouse.gov',
      },
      {
        username: 'OccupyMars',
        fullname: 'Elon Musk',
        firstname: 'Elon',
        lastname: 'Musk',
        email: 'elon@spacex.com',
      },
      {
        username: 'EloquentPen',
        fullname: 'Jane Austen',
        firstname: 'Jane',
        lastname: 'Austen',
        email: 'jane@northangerabbey.co.uk',
      },
    ],
  }

  public getUserCopy(): any {
    var index = Math.floor(Math.random() * (this.userCopy.placeholders.length - 1) + 1)

    return this.userCopy.placeholders[index]
  }
}

export interface CopyUser {
  username: string
  fullname: string
  firstname: string
  lastname: string
  email: string
}
