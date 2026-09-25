@tool
extends Node2D

signal level_completed
signal player_died

@export var level_number := 1
var game: Node
var player: CharacterBody2D
var required_coins := 0
var collected_here := 0
var exit_unlocked := false
var exit_area: Area2D
var lock_label: Label
var checkpoint_position := Vector2.ZERO

func _ready() -> void:
	queue_redraw()
	build_level()

func build_level() -> void:
	var data := get_level_data()
	required_coins = data.coins.size()
	create_theme_decorations()
	for platform in data.platforms:
		create_platform(platform[0], platform[1])
	for coin_position in data.coins:
		create_coin(coin_position)
	for moving in data.moving:
		create_moving_platform(moving[0], moving[1])
	for lever_position in data.levers:
		create_lever(lever_position)
	for spike_position in data.spikes:
		create_spikes(spike_position)
	checkpoint_position = data.spawn
	for checkpoint in data.checkpoints:
		create_checkpoint(checkpoint)
	for enemy_position in data.enemies:
		create_enemy(enemy_position, false)
	if data.boss != Vector2.ZERO:
		create_enemy(data.boss, true)
	create_exit(data.exit)
	create_player(data.spawn)

func add_generated_child(node: Node) -> void:
	add_child(node)
	if Engine.is_editor_hint():
		node.owner = self

func create_player(spawn: Vector2) -> void:
	player = CharacterBody2D.new()
	player.set_script(load("res://scripts/player.gd"))
	player.position = spawn - Vector2(0, 8)
	var shape := CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = Vector2(34, 58)
	shape.shape = rectangle
	shape.position.y = -2.0
	player.add_child(shape)
	player.died.connect(_on_player_died)
	player.connect("projectile_requested", Callable(self, "spawn_projectile"))
	if game:
		player.connect("health_changed", Callable(game.hud, "update_health"))
		game.hud.update_health(100)
	add_generated_child(player)
	var camera := Camera2D.new()
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 7.0
	camera.limit_left = 0
	camera.limit_right = 2600
	camera.limit_top = 0
	camera.limit_bottom = 720
	player.add_child(camera)

func _on_player_died() -> void:
	player_died.emit()

func spawn_projectile(origin: Vector2, direction: float) -> void:
	var projectile := Area2D.new()
	projectile.set_script(load("res://scripts/projectile.gd"))
	projectile.global_position = origin
	projectile.direction = direction
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 9.0
	shape.shape = circle
	projectile.add_child(shape)
	add_child(projectile)

func create_platform(rect: Rect2, color: Color, _solid := true) -> void:
	var body := StaticBody2D.new()
	body.position = rect.position + rect.size / 2.0
	var shape := CollisionShape2D.new()
	var box := RectangleShape2D.new()
	box.size = rect.size
	shape.shape = box
	body.add_child(shape)
	var terrain_name := "grass"
	if level_number == 2:
		terrain_name = "stone"
	elif level_number == 3:
		terrain_name = "purple"
	elif level_number == 4:
		terrain_name = "dirt"
	var tile_columns := maxi(1, ceili(rect.size.x / 64.0))
	var tile_rows := maxi(1, ceili(rect.size.y / 64.0))
	for tile_x in range(tile_columns):
		for tile_y in range(tile_rows):
			var tile := Sprite2D.new()
			var tile_kind := "horizontal_middle" if tile_y == 0 else "block_center"
			tile.texture = load("res://assets/sprites/terrain_%s_%s.png" % [terrain_name, tile_kind])
			tile.position = Vector2(-rect.size.x / 2.0 + tile_x * 64.0 + 32.0, -rect.size.y / 2.0 + tile_y * 64.0 + 32.0)
			body.add_child(tile)
	add_generated_child(body)
	if rect.size.x < 1000.0:
		var decoration_path := "res://assets/sprites/bush.png" if int(rect.position.x / 64.0) % 2 == 0 else "res://assets/sprites/rock.png"
		create_decoration(decoration_path, Vector2(rect.position.x + rect.size.x * 0.28, rect.position.y - 25.0), 0.85)

func create_decoration(texture_path: String, position_value: Vector2, scale_value := 1.0) -> void:
	var decoration := Sprite2D.new()
	decoration.texture = load(texture_path)
	decoration.position = position_value
	decoration.scale = Vector2.ONE * scale_value
	add_generated_child(decoration)

func create_theme_decorations() -> void:
	var terrain_name := "grass"
	if level_number == 2:
		terrain_name = "stone"
	elif level_number == 3:
		terrain_name = "purple"
	elif level_number == 4:
		terrain_name = "dirt"
	for index in range(14):
		var cloud := Sprite2D.new()
		cloud.texture = load("res://assets/sprites/terrain_%s_cloud_background.png" % terrain_name)
		cloud.position = Vector2(index * 210.0 + 70.0, 150.0 + (index % 3) * 42.0)
		cloud.modulate = Color(1, 1, 1, 0.32 if level_number < 4 else 0.2)
		cloud.scale = Vector2(1.4, 1.4)
		add_generated_child(cloud)
	if level_number >= 2:
		for torch_position in [Vector2(260, 500), Vector2(1260, 280), Vector2(2020, 500)]:
			create_decoration("res://assets/sprites/torch_on_a.png", torch_position, 0.72)
	if level_number == 1:
		create_decoration("res://assets/sprites/bush.png", Vector2(240, 460), 1.0)
		create_decoration("res://assets/sprites/bush.png", Vector2(1980, 370), 1.0)
	elif level_number == 3:
		for crystal_position in [Vector2(520, 470), Vector2(1450, 310), Vector2(2040, 290)]:
			create_decoration("res://assets/sprites/rock.png", crystal_position, 0.7)
	else:
		create_decoration("res://assets/sprites/bridge_logs.png", Vector2(1120, 570), 0.8)

func create_coin(position_value: Vector2) -> void:
	var coin := Area2D.new()
	coin.set_script(load("res://scripts/collectible.gd"))
	coin.position = position_value
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 12.0
	shape.shape = circle
	coin.add_child(shape)
	var visual := Sprite2D.new()
	visual.texture = load("res://assets/sprites/coin_gold.png")
	visual.scale = Vector2(0.58, 0.58)
	coin.add_child(visual)
	add_generated_child(coin)

func create_moving_platform(position_value: Vector2, travel: Vector2) -> void:
	var platform := AnimatableBody2D.new()
	platform.set_script(load("res://scripts/moving_platform.gd"))
	platform.position = position_value
	platform.travel = travel
	var shape := CollisionShape2D.new()
	var box := RectangleShape2D.new()
	box.size = Vector2(150, 20)
	shape.shape = box
	platform.add_child(shape)
	add_generated_child(platform)

func create_lever(position_value: Vector2) -> void:
	var lever := Area2D.new()
	lever.set_script(load("res://scripts/lever.gd"))
	lever.position = position_value
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 42.0
	shape.shape = circle
	lever.add_child(shape)
	var visual := Sprite2D.new()
	visual.texture = load("res://assets/sprites/switch_yellow.png")
	visual.scale = Vector2(0.8, 0.8)
	lever.add_child(visual)
	lever.pulled.connect(_on_lever_pulled)
	add_generated_child(lever)

func create_spikes(position_value: Vector2) -> void:
	var spikes := Area2D.new()
	spikes.position = position_value
	var shape := CollisionShape2D.new()
	var rectangle := RectangleShape2D.new()
	rectangle.size = Vector2(52, 22)
	shape.shape = rectangle
	shape.position.y = 14.0
	spikes.add_child(shape)
	var visual := Sprite2D.new()
	visual.texture = load("res://assets/sprites/spikes.png")
	visual.scale = Vector2(0.82, 0.82)
	spikes.add_child(visual)
	spikes.body_entered.connect(_on_spikes_body_entered)
	add_generated_child(spikes)

func create_checkpoint(position_value: Vector2) -> void:
	var checkpoint := Area2D.new()
	checkpoint.position = position_value
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 34.0
	shape.shape = circle
	checkpoint.add_child(shape)
	var visual := Sprite2D.new()
	visual.texture = load("res://assets/sprites/torch_on_a.png")
	visual.scale = Vector2(0.75, 0.75)
	checkpoint.add_child(visual)
	checkpoint.body_entered.connect(_on_checkpoint_entered.bind(position_value))
	add_generated_child(checkpoint)

func _on_checkpoint_entered(body: Node, position_value: Vector2) -> void:
	if body != player or position_value.x <= checkpoint_position.x:
		return
	checkpoint_position = position_value
	player.spawn_position = checkpoint_position - Vector2(0, 8)

func _on_spikes_body_entered(body: Node) -> void:
	if body.has_method("take_damage"):
		body.take_damage(100)

func create_enemy(position_value: Vector2, is_boss: bool) -> void:
	var enemy := CharacterBody2D.new()
	enemy.set_script(load("res://scripts/enemy.gd"))
	enemy.boss = is_boss
	enemy.move_speed = 55.0 + level_number * 12.0
	enemy.position = position_value
	var shape := CollisionShape2D.new()
	var box := RectangleShape2D.new()
	box.size = Vector2(65 if is_boss else 46, 75 if is_boss else 54)
	if not is_boss:
		shape.position.y = -4.0
	shape.shape = box
	enemy.add_child(shape)
	add_generated_child(enemy)

func create_exit(position_value: Vector2) -> void:
	exit_area = Area2D.new()
	exit_area.position = position_value
	var shape := CollisionShape2D.new()
	var box := RectangleShape2D.new()
	box.size = Vector2(54, 90)
	shape.shape = box
	exit_area.add_child(shape)
	exit_area.body_entered.connect(_on_exit_entered)
	add_generated_child(exit_area)
	create_decoration("res://assets/sprites/sign_exit.png", position_value + Vector2(0, -34), 0.9)
	lock_label = Label.new()
	lock_label.text = "VERROUILLE\n%d CRISTAUX" % required_coins
	lock_label.position = position_value + Vector2(-62, -76)
	lock_label.add_theme_color_override("font_color", Color("#f4c95d"))
	lock_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lock_label.size = Vector2(125, 55)
	add_generated_child(lock_label)

func _on_lever_pulled() -> void:
	exit_unlocked = true
	lock_label.text = "SORTIE\nOUVERTE"
	lock_label.add_theme_color_override("font_color", Color("#b8f2e6"))

func _on_exit_entered(body: Node) -> void:
	if body != player:
		return
	if collected_here >= required_coins or exit_unlocked:
		level_completed.emit()
	else:
		lock_label.text = "RAMASSE LES\nCRISTAUX"

func _process(_delta: float) -> void:
	if game and player:
		collected_here = game.collected_coins - (0 if level_number == 1 else get_previous_coin_count())
		if collected_here >= required_coins and not exit_unlocked:
			exit_unlocked = true
			lock_label.text = "SORTIE\nOUVERTE"
	queue_redraw()

func get_previous_coin_count() -> int:
	if level_number == 1:
		return 0
	if level_number == 2:
		return 4
	if level_number == 3:
		return 9
	return 15

func reset_player() -> void:
	player.reset_to_spawn()

func get_level_data() -> Dictionary:
	if level_number == 1:
		return {"spawn": Vector2(140, 500), "exit": Vector2(2350, 530), "checkpoints": [Vector2(900, 360), Vector2(1850, 380)], "platforms": [[Rect2(0, 620, 2600, 100), Color("#263b44")], [Rect2(0, 520, 360, 28), Color("#4aa3a2")], [Rect2(470, 470, 310, 28), Color("#4aa3a2")], [Rect2(900, 410, 330, 28), Color("#4aa3a2")], [Rect2(1360, 500, 340, 28), Color("#4aa3a2")], [Rect2(1850, 430, 500, 28), Color("#4aa3a2")]], "coins": [Vector2(180, 470), Vector2(560, 420), Vector2(1000, 360), Vector2(1460, 450)], "moving": [[Vector2(820, 530), Vector2(0, -100)]], "levers": [Vector2(1740, 560)], "spikes": [], "enemies": [Vector2(650, 420)], "boss": Vector2.ZERO}
	if level_number == 2:
		return {"spawn": Vector2(140, 500), "exit": Vector2(2390, 530), "checkpoints": [Vector2(1080, 240), Vector2(1730, 410)], "platforms": [[Rect2(0, 620, 2600, 100), Color("#303b52")], [Rect2(0, 520, 300, 28), Color("#6980a8")], [Rect2(420, 470, 220, 28), Color("#6980a8")], [Rect2(760, 380, 200, 28), Color("#6980a8")], [Rect2(1080, 300, 220, 28), Color("#6980a8")], [Rect2(1400, 390, 220, 28), Color("#6980a8")], [Rect2(1730, 470, 220, 28), Color("#6980a8")], [Rect2(2070, 520, 380, 28), Color("#6980a8")]], "coins": [Vector2(150, 470), Vector2(500, 420), Vector2(830, 330), Vector2(1150, 250), Vector2(1470, 340), Vector2(1800, 420)], "moving": [[Vector2(660, 540), Vector2(0, -190)], [Vector2(1320, 520), Vector2(0, -170)], [Vector2(1650, 350), Vector2(0, 130)]], "levers": [Vector2(1010, 560), Vector2(1980, 560)], "spikes": [Vector2(700, 607), Vector2(1990, 607)], "enemies": [Vector2(540, 420), Vector2(1480, 340), Vector2(1840, 420)], "boss": Vector2.ZERO}
	if level_number == 3:
		return {"spawn": Vector2(140, 500), "exit": Vector2(2420, 530), "checkpoints": [Vector2(1010, 470), Vector2(1600, 420)], "platforms": [[Rect2(0, 620, 2600, 100), Color("#3d2944")], [Rect2(0, 520, 280, 28), Color("#8c5ca8")], [Rect2(390, 520, 200, 28), Color("#8c5ca8")], [Rect2(700, 430, 190, 28), Color("#8c5ca8")], [Rect2(1010, 520, 180, 28), Color("#8c5ca8")], [Rect2(1320, 360, 180, 28), Color("#8c5ca8")], [Rect2(1600, 470, 180, 28), Color("#8c5ca8")], [Rect2(1880, 340, 190, 28), Color("#8c5ca8")], [Rect2(2190, 520, 300, 28), Color("#8c5ca8")]], "coins": [Vector2(130, 470), Vector2(450, 470), Vector2(760, 380), Vector2(1070, 470), Vector2(1380, 310), Vector2(1660, 420), Vector2(1940, 290), Vector2(2280, 470)], "moving": [[Vector2(610, 560), Vector2(0, -210)], [Vector2(930, 420), Vector2(0, 160)], [Vector2(1530, 570), Vector2(0, -220)]], "levers": [Vector2(1210, 570), Vector2(2110, 570)], "spikes": [Vector2(300, 607), Vector2(620, 607), Vector2(920, 607), Vector2(1210, 607), Vector2(1810, 607), Vector2(2100, 607)], "enemies": [Vector2(500, 470), Vector2(820, 380), Vector2(1450, 310), Vector2(1980, 290)], "boss": Vector2.ZERO}
	return {"spawn": Vector2(150, 500), "exit": Vector2(2350, 530), "checkpoints": [Vector2(930, 400), Vector2(1640, 400)], "platforms": [[Rect2(0, 620, 2600, 100), Color("#241d32")], [Rect2(0, 520, 420, 28), Color("#b15b5b")], [Rect2(560, 500, 260, 28), Color("#b15b5b")], [Rect2(930, 450, 260, 28), Color("#b15b5b")], [Rect2(1290, 500, 260, 28), Color("#b15b5b")], [Rect2(1640, 450, 260, 28), Color("#b15b5b")], [Rect2(1990, 500, 500, 28), Color("#b15b5b")]], "coins": [Vector2(170, 470), Vector2(650, 450), Vector2(1020, 400), Vector2(1380, 450), Vector2(1730, 400), Vector2(2080, 450)], "moving": [[Vector2(840, 560), Vector2(0, -170)], [Vector2(1560, 550), Vector2(0, -170)]], "levers": [Vector2(1220, 570), Vector2(1940, 570)], "spikes": [Vector2(440, 607), Vector2(850, 607), Vector2(1210, 607), Vector2(1570, 607), Vector2(1920, 607)], "enemies": [Vector2(680, 450), Vector2(1060, 400), Vector2(1740, 400)], "boss": Vector2(2140, 390)}

func _draw() -> void:
	var skies: Array[Color] = [Color("#183542"), Color("#252f4a"), Color("#3d2944"), Color("#241d32")]
	var sky: Color = skies[level_number - 1]
	draw_rect(Rect2(0, 0, 2600, 720), sky)
	for index in 10:
		var x := float(index * 280 + 80)
		draw_circle(Vector2(x, 125 + (index % 3) * 55), 2.5, Color("#b8f2e6"))
	draw_string(ThemeDB.fallback_font, Vector2(72, 110), ["LA VALLEE DES ECHOS", "LES MINES SUSPENDUES", "LE COEUR DU GEANT", "ARENE DU WRAITH" ][level_number - 1], HORIZONTAL_ALIGNMENT_LEFT, -1, 28, Color("#ffffff80"))
