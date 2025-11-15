from sanic import Sanic, response
from sanic_cors import CORS

app = Sanic("BirdsAPI")
CORS(app)

# Sample bird data
birds_data = [
    {"id": 1, "name": "Cardinal", "species": "Cardinalis cardinalis", "color": "Red"},
    {"id": 2, "name": "Blue Jay", "species": "Cyanocitta cristata", "color": "Blue"},
    {"id": 3, "name": "Robin", "species": "Turdus migratorius", "color": "Orange"},
    {"id": 4, "name": "Goldfinch", "species": "Spinus tristis", "color": "Yellow"},
    {"id": 5, "name": "Chickadee", "species": "Poecile atricapillus", "color": "Black and White"},
]

@app.route("/")
async def index(request):
    return response.json({"message": "Welcome to the Birds API!"})

@app.route("/api/birds")
async def get_birds(request):
    return response.json({"birds": birds_data})

@app.route("/api/birds/<bird_id:int>")
async def get_bird(request, bird_id):
    bird = next((b for b in birds_data if b["id"] == bird_id), None)
    if bird:
        return response.json(bird)
    return response.json({"error": "Bird not found"}, status=404)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, dev=True)
