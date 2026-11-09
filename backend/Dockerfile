FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ConfeitarIA.API/ConfeitarIA.API.csproj", "ConfeitarIA.API/"]
COPY ["ConfeitarIA.Application/ConfeitarIA.Application.csproj", "ConfeitarIA.Application/"]
COPY ["ConfeitarIA.Domain/ConfeitarIA.Domain.csproj", "ConfeitarIA.Domain/"]
COPY ["ConfeitarIA.Infrastructure/ConfeitarIA.Infrastructure.csproj", "ConfeitarIA.Infrastructure/"]
RUN dotnet restore "ConfeitarIA.API/ConfeitarIA.API.csproj"

COPY . .
WORKDIR "/src/ConfeitarIA.API"
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ConfeitarIA.API.dll"]
