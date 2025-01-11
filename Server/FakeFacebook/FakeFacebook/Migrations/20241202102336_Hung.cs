using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FakeFacebook.Migrations
{
    /// <inheritdoc />
    public partial class Hung : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GET_IT",
                table: "CHAT_CONTENT",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GET_IT",
                table: "CHAT_CONTENT");
        }
    }
}
