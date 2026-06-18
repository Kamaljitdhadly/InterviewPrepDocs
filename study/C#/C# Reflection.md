# C# Reflection

## Questions Covered

1. What is GAC?
2. What is Reflection?
3. What is meant by Globalization and Localization?

## What is GAC?

The **Global Assembly Cache (GAC)** is a Windows folder for shared .NET assemblies used by multiple applications — available machine-wide without copying into each app directory.

**Key features:**

- **Centralized storage** — one copy shared across apps.
- **Versioning** — multiple versions of the same assembly side by side.
- **Strong naming** — only strongly named assemblies (name, version, culture, public key token) can be installed.
- **Security** — strong names help prevent unauthorized modification.

**When to use:** shared libraries on one machine; maintaining multiple assembly versions for different apps.

**Install methods:**

1. **gacutil** command-line tool:

```bash
gacutil -i MyAssembly.dll
```

2. **Drag and drop** into `C:\Windows\assembly` (.NET Framework) or `C:\Windows\Microsoft.NET\assembly` (newer).
3. **Installer** — setup project that registers into the GAC.

**Locations:** .NET Framework → `C:\Windows\assembly`; .NET Core/5+ rarely use the GAC (assemblies under `C:\Windows\Microsoft.NET\assembly` when needed).

**Disadvantages:** added deployment/versioning complexity; harder dependency management across environments; shared instances can cause version conflicts between apps.

Use the GAC carefully — modern .NET favors NuGet and local deployment over GAC installs.

## What is Reflection?

**Reflection** inspects and interacts with type, assembly, and object metadata at runtime — discovering types, invoking methods, reading/setting members, retrieving attributes, and creating instances dynamically.

**Key capabilities:**

- **Type discovery** — examine classes, interfaces, structs, enums and their members.
- **Method invocation** — call methods when the name is unknown at compile time.
- **Properties/fields** — get/set values, including private members (use cautiously).
- **Attributes** — read custom attributes for serialization, validation, etc.
- **Instance creation** — `Activator.CreateInstance` for types known only at runtime.

Implemented via `System.Reflection`.

```csharp
using System;
using System.Reflection;

public class ExampleClass
{
    public int ExampleProperty { get; set; }
    public void ExampleMethod()
    {
        Console.WriteLine("ExampleMethod called.");
    }
}

class Program
{
    static void Main()
    {
        Type type = typeof(ExampleClass);
        Console.WriteLine("Type: " + type.Name);

        PropertyInfo[] properties = type.GetProperties();
        Console.WriteLine("Properties:");
        foreach (var property in properties)
            Console.WriteLine("- " + property.Name);

        MethodInfo[] methods = type.GetMethods(
            BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
        Console.WriteLine("Methods:");
        foreach (var method in methods)
            Console.WriteLine("- " + method.Name);

        var instance = Activator.CreateInstance(type);

        MethodInfo exampleMethod = type.GetMethod("ExampleMethod");
        exampleMethod.Invoke(instance, null);

        PropertyInfo exampleProperty = type.GetProperty("ExampleProperty");
        exampleProperty.SetValue(instance, 42);
        int value = (int)exampleProperty.GetValue(instance);
        Console.WriteLine("ExampleProperty value: " + value);
    }
}
```

**When to use:** plugin systems; metadata/attribute inspection; dynamic instance creation; custom serialization.

**Caveats:** slower than direct access; can bypass access restrictions — use judiciously.

## What is meant by Globalization and Localization?

**Globalization** designs culture-neutral software that works across languages/regions without core changes. **Localization** adapts that software to a specific locale — translation, layout, and cultural adjustments.

**Globalization aspects:**

- Date/time/number/currency formats (e.g., `MM/DD/YYYY` vs `DD/MM/YYYY`).
- Unicode and character encodings.
- Cultural conventions — sorting, calendars, metric vs imperial.
- Language-neutral design.

**Localization aspects:**

- UI text and error message translation.
- `.resx` resource files for culture-specific content.
- Cultural adaptation of symbols, colors, icons.
- Local legal/regulatory compliance.

In .NET, use `System.Globalization`, `System.Resources`, and `.resx` files.

**Globalization example:**

```csharp
using System;
using System.Globalization;

class Program
{
    static void Main()
    {
        CultureInfo cultureUS = new CultureInfo("en-US");
        Console.WriteLine("Date in US format: " + DateTime.Now.ToString(cultureUS));

        CultureInfo cultureFR = new CultureInfo("fr-FR");
        Console.WriteLine("Date in French format: " + DateTime.Now.ToString(cultureFR));
    }
}
```

**Localization example:**

```csharp
using System;
using System.Resources;
using System.Reflection;

class Program
{
    static void Main()
    {
        ResourceManager rm = new ResourceManager(
            "MyApp.Resources.Strings", Assembly.GetExecutingAssembly());
        string greeting = rm.GetString("Hello", new CultureInfo("fr-FR"));
        Console.WriteLine(greeting); // "Bonjour" if properly localized
    }
}
```

**Summary:** globalization = culture-neutral design; localization = locale-specific adaptation. Together they enable apps for a global audience.
