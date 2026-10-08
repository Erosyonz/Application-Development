namespace appdev.Domain;

public class Rider : User
{
    public string FullName { get; set; } = "";
    public string ContactNumber { get; private set; } = "";
    public VehicleType VehicleType { get; private set; }
    public string VehicleModel { get; private set; } = "";
    public string PlateNumber { get; private set; } = "";
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public void UpdateProfile(string fullName, string contactNumber)
    {
        FullName = fullName;
        ContactNumber = contactNumber;
    }

    public void UpdateVehicle(VehicleType type, string model, string plate)
    {
        VehicleType = type;
        VehicleModel = model;
        PlateNumber = plate;
    }

    public override string GetRole() => "Rider";
}