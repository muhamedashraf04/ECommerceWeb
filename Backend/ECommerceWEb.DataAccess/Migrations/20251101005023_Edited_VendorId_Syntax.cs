using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerceWeb.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Edited_VendorId_Syntax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Category_Category_ID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Vendor_Vendor_ID",
                table: "Product");

            migrationBuilder.RenameColumn(
                name: "Vendor_ID",
                table: "Product",
                newName: "VendorId");

            migrationBuilder.RenameColumn(
                name: "Category_ID",
                table: "Product",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Product_Vendor_ID",
                table: "Product",
                newName: "IX_Product_VendorId");

            migrationBuilder.RenameIndex(
                name: "IX_Product_Category_ID",
                table: "Product",
                newName: "IX_Product_CategoryId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Category_CategoryId",
                table: "Product",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Vendor_VendorId",
                table: "Product",
                column: "VendorId",
                principalTable: "Vendor",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Vendor_VendorId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Category_CategoryId",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Vendor_VendorId",
                table: "Product");

            migrationBuilder.DropIndex(
                name: "IX_Order_VendorId",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "Order");

            migrationBuilder.RenameColumn(
                name: "VendorId",
                table: "Product",
                newName: "Vendor_ID");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Product",
                newName: "Category_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_VendorId",
                table: "Product",
                newName: "IX_Product_Vendor_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_CategoryId",
                table: "Product",
                newName: "IX_Product_Category_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Category_Category_ID",
                table: "Product",
                column: "Category_ID",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Vendor_Vendor_ID",
                table: "Product",
                column: "Vendor_ID",
                principalTable: "Vendor",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
