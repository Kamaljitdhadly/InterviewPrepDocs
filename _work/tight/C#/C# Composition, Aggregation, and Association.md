# C# Composition, Aggregation, and Association

## Questions Covered

1. What is Association?
2. What is Aggregation?
3. What is Composition?

## What is Association?

**Association** is a general relationship where one class uses or interacts with another — no ownership implied. Can be unidirectional or bidirectional; object lifetimes are independent.

```csharp
public class Driver
{
    public string Name { get; set; }

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

`Driver` uses `Car` but neither owns the other — both exist independently.

## What is Aggregation?

**Aggregation** is a "whole-part" association where the whole contains parts, but parts can **outlive** the whole. Typically unidirectional.

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

`Team` aggregates `Player` objects that exist independently.

## What is Composition?

**Composition** is a stronger whole-part relationship where the whole **owns** the part — the part cannot outlive the whole. Unidirectional; part lifecycle tied to whole.

```csharp
public class House
{
    public Room LivingRoom { get; set; }

    public House()
    {
        LivingRoom = new Room(); // Created with the house
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
        house = null; // Room destroyed with the house
    }
}
```

`Room` is created inside `House` and destroyed when `House` is destroyed.

**Summary:**

| **Concept** | **Description** | **Lifetime** | **Example** |
|---|---|---|---|
| **Association** | One class uses another; no ownership | Independent | Driver and Car |
| **Aggregation** | Whole contains parts | Parts outlive whole | Team and Players |
| **Composition** | Whole owns parts | Parts die with whole | House and Room |

These relationships model real-world object interactions in OOP design.
