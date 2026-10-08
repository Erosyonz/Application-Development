namespace appdev.Domain;

public class Review
{
    public int Id { get; set; }
    public int RiderId { get; set; }
    public int? RouteId { get; set; }          // null = general club review
    public int Rating { get; private set; }    // 1-5
    public string Comment { get; private set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Review(int riderId, int? routeId, int rating, string comment)
    {
        RiderId = riderId;
        RouteId = routeId;
        Rating = rating;
        Comment = comment;
    }

    public void Edit(int rating, string comment)
    {
        Rating = rating;
        Comment = comment;
    }

    public bool IsValid() => Rating is >= 1 and <= 5 && !string.IsNullOrWhiteSpace(Comment);
}