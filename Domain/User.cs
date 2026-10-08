using System.Security.Cryptography;
using System.Text;

namespace appdev.Domain;

public abstract class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    protected DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    private string PasswordHash { get; set; } = "";

    public void SetPassword(string password) => PasswordHash = HashPassword(password);
    public bool VerifyPassword(string password) => PasswordHash == HashPassword(password);

    public bool ChangePassword(string oldPw, string newPw)
    {
        if (!VerifyPassword(oldPw)) return false;
        SetPassword(newPw);
        return true;
    }

    public abstract string GetRole();

    private static string HashPassword(string password) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
}