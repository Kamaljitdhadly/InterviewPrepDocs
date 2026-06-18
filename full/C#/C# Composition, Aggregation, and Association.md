# C# Composition, Aggregation, and Association

In object-oriented programming, particularly in C#, **Composition**, **Aggregation**, and **Association** describe relationships between objects. These concepts help model real-world scenarios where objects interact with one another.

### 1. Association

Association represents a relationship between two classes where one class uses or interacts with another. It is a general term that describes a connection between classes, and it does not imply any ownership.

- **Direction**: Association can be unidirectional (one class knows about the other) or bidirectional (both classes know about each other).

- **Lifetime**: The lifespan of the associated objects is independent.

### Example of Association

```csharp
public class Driver
{
  public string Name { get; set; }
  // The driver drives a car (unidirectional association)
  public void Drive(Car car)
  {
    Console.WriteLine($"{Name} is driving a {car.Model}");
  }
}
public class Car
{
  public string Model { get; set; }
}
class Program
{
  static void Main(string[] args)
  {
    Driver driver = new Driver { Name = "John" };
    Car car = new Car { Model = "Toyota" };
    driver.Drive(car); // John is driving a Toyota
  }
}
```

- **Explanation**: Here, the Driver class is associated with the Car class. The Driver can drive a Car, but neither class owns the other, and they can exist independently.

### 2. Aggregation

Aggregation is a special form of association where one class (the whole) contains or is composed of other classes (the parts). However, the lifecycle of the parts is independent of the whole. This means that even if the whole object is destroyed, the parts can still exist.

- **Direction**: Typically unidirectional.

- **Lifetime**: The parts can outlive the whole.

### Example of Aggregation

```csharp
public class Team
{
  public string Name { get; set; }
  public List<Player> Players { get; set; } = new List<Player>();
  public void AddPlayer(Player player)
  {
    Players.Add(player);
  }
}
public class Player
{
  public string Name { get; set; }
}
class Program
{
  static void Main(string[] args)
  {
    Player player1 = new Player { Name = "Alice" };
    Player player2 = new Player { Name = "Bob" };
    Team team = new Team { Name = "Dream Team" };
    team.AddPlayer(player1);
    team.AddPlayer(player2);
    // Players still exist even if the team is destroyed
  }
}
```

- **Explanation**: In this example, a Team aggregates Player objects. The Player instances exist independently of the Team. If the Team is destroyed, the Player objects still exist.

### 3. Composition

Composition is a stronger form of association where one class (the whole) owns another class (the part). The lifecycle of the part is tied to the lifecycle of the whole. If the whole object is destroyed, the part object is also destroyed.

- **Direction**: Unidirectional.

- **Lifetime**: The parts do not outlive the whole.

### Example of Composition

```csharp
public class House
{
  public Room LivingRoom { get; set; }
  public House()
  {
    // The room is created when the house is created
    LivingRoom = new Room();
  }
}
public class Room
{
  public string Type { get; set; } = "Living Room";
}
class Program
{
  static void Main(string[] args)
  {
    House house = new House();
    Console.WriteLine("House has a " + house.LivingRoom.Type);
    // When the house is destroyed, the room is also destroyed
    house = null;
  }
}
```

- **Explanation**: In this example, a House contains a Room. The Room is created when the House is created and will be destroyed when the House is destroyed. The Room does not exist independently of the House.

### Summary of Differences

| **Concept** | **Description** | **Lifetime Dependency** | **Example** |
|----|----|----|----|
| **Association** | A general relationship between two classes where one class uses or interacts with another. | Independent | Driver and Car |
| **Aggregation** | A "whole-part" relationship where the part can exist independently of the whole. | Parts can outlive the whole. | Team and Players |
| **Composition** | A stronger "whole-part" relationship where the part cannot exist independently of the whole. | Parts are destroyed with the whole. | House and Room |

These concepts are essential in designing robust and intuitive object-oriented systems, helping to model real-world relationships effectively.
