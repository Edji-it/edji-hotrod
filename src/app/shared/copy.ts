export class Copy {
  private userCopy: { placeholders: CopyUser[] } = {
    placeholders: [
      {
        username: 'pokemaster',
        fullname: 'Ash Ketchum',
        firstName: 'Ash',
        lastName: 'Ketchum',
        email: 'ash@ketchum.all',
      },
      {
        username: 'spongedude',
        fullname: 'Spongebob Squarepants',
        firstName: 'Spongebob',
        lastName: 'Squarepants',
        email: 'spongebob@bottom.sea',
      },
      {
        username: 'atomboy',
        fullname: 'Jimmy Neutron',
        firstName: 'Jimmy',
        lastName: 'Neutron',
        email: 'jimmy@boygenius.edu',
      },
      {
        username: 'scooby_snack',
        fullname: 'Scooby Dooby Doo',
        firstName: 'Scooby',
        lastName: 'Doo',
        email: 'scooby@mysterymachine.co',
      },
      {
        username: 'yabbadabbadoo',
        fullname: 'Fred Flintstone',
        firstName: 'Fred',
        lastName: 'Flintstone',
        email: 'fred.flinstone@slaterockgravel.co',
      },
      {
        username: 'spaceman15',
        fullname: 'George Jetson',
        firstName: 'George',
        lastName: 'Jetson',
        email: 'george.jetson@spacelyspacesprockets.com',
      },
      {
        username: 'RespectTheWand',
        fullname: 'Wanda Venus Fairywinkle-Cosma',
        firstName: 'Wanda',
        lastName: 'Fairywinkle-Cosma',
        email: 'wanda@fairygodparents.com',
      },
      {
        username: 'iExplore',
        fullname: 'Dora Márquez',
        firstName: 'Dora',
        lastName: 'Márquez',
        email: 'dora@explorer.gov',
      },
      {
        username: 'PoorRichard',
        fullname: 'Benjamin Franklin',
        firstName: 'Benjamin',
        lastName: 'Franklin',
        email: 'ben@whitehouse.gov'
      },
      {
        username: 'OccupyMars',
        fullname: 'Elon Musk',
        firstName: 'Elon',
        lastName: 'Musk',
        email: 'elon@spacex.com'
      },
      {
        username: 'EloquentPen',
        fullname: 'Jane Austen',
        firstName: 'Jane',
        lastName: 'Austen',
        email: 'jane@northangerabbey.co.uk'
      }
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
  firstName: string
  lastName: string
  email: string
}