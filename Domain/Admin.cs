namespace appdev.Domain;

public class Admin : User
{
    public override string GetRole() => "Admin";
}
