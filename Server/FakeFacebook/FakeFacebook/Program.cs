using FakeFacebook.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.OpenApi.Models;
using FakeFacebook.Hubs;
using FakeFacebook.Commom;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<RsaKeyManager>();
//builder.WebHost.UseUrls("http://localhost:7158");
builder.WebHost.UseUrls("http://0.0.0.0:7158", "https://0.0.0.0:5176");
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://117.6.106.251") // URL frontend
            //policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  ;


        });


});

//thêm Sginal
builder.Services.AddSignalR();


// cấu hình jwt
var key = builder.Configuration["JwtSettings:SecretKey"];
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5176);  // HTTP
    options.ListenAnyIP(7158, listenOptions =>
    {
        listenOptions.UseHttps();  // HTTPS nếu cần
    });
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            //ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            //ValidAudience = builder.Configuration["JwtSettings:Audience"],


        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            },

            OnChallenge = context =>
            {

                // Chặn hành vi mặc định khi không xác thực thành công
                context.HandleResponse();

                // Chuyển hướng đến trang đăng nhập hoặc trả về lỗi
                if (!context.HttpContext.User.Identity.IsAuthenticated)
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    return context.Response.WriteAsync("{\"error\":\"Bạn cần đăng nhập để truy cập vào hệ thống.\"}");
                }

                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<JwtTokenService>();

// Add Authorization với Policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ViewSensitiveDataPolicy", policy =>
        policy.RequireRole("Admin")
              .RequireClaim("Permission", "ViewSensitiveData"));
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // Cấu hình để Swagger hỗ trợ Authorization với Bearer token
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<FakeFacebookDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
// Use Aut


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c => c.SerializeAsV2 = true);
    app.UseSwaggerUI(c =>
    {

        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
     
    });
}
app.UseDefaultFiles();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapHub<ChatHub>("/hub");
app.MapControllers();
app.UseSpa(spa =>
{
    spa.Options.SourcePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/AngularView");

    //if (app.Environment.IsDevelopment())
    //{
    //    // Nếu bạn đang phát triển, sử dụng Proxy đến server Angular để phục vụ ứng dụng từ ng serve
    //    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
    //}
});
app.Run();
