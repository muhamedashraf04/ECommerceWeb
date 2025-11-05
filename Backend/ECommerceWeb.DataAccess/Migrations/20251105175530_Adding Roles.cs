using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerceWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddingRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Vendor");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Customer");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Vendor",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Vendor",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Customer",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Customer",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Vendor",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Customer",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "Role" },
                values: new object[] { "Omar Shoulkamy", null });

            migrationBuilder.UpdateData(
                table: "Vendor",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "Role" },
                values: new object[] { "John Vendor", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Vendor");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Customer");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Vendor",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Vendor",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Customer",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Customer",
                newName: "LastName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Vendor",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Customer",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FirstName", "LastName" },
                values: new object[] { "Omar", "Shoulkamy" });

            migrationBuilder.UpdateData(
                table: "Vendor",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FirstName", "LastName" },
                values: new object[] { "John", "Vendor" });
        }
    }
}
