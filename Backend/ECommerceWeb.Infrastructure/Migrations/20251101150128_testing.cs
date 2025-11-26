using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerceWeb.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class testing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Vendor_VendorId",
                table: "Order");

            migrationBuilder.DropIndex(
                name: "IX_Order_VendorId",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "Order");

            migrationBuilder.AddColumn<int>(
                name: "num_of_items",
                table: "Cart",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Cart",
                keyColumn: "Id",
                keyValue: 1,
                column: "num_of_items",
                value: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "num_of_items",
                table: "Cart");

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "Order",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Order",
                keyColumn: "Id",
                keyValue: 1,
                column: "VendorId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Order_VendorId",
                table: "Order",
                column: "VendorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Vendor_VendorId",
                table: "Order",
                column: "VendorId",
                principalTable: "Vendor",
                principalColumn: "Id");
        }
    }
}
