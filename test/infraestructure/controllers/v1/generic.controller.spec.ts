import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenericController } from "../../../../src/infraestructure/controllers/v1/generic.controller";

describe("GenericController", () => {

  // ============================================
  // Mocks de todos los Use Cases
  // ============================================

  let getGenericUseCaseMock: any;
  let createGenericUseCaseMock: any;
  let updateGenericUseCaseMock: any;
  let getXIdGenericUseCaseMock: any;
  let getPokemonXNameUseCaseMock: any;

  let controller: GenericController;

  // ============================================
  // Mock reusable de Response (Express)
  // ============================================
  const mockResponse = () => {
    const res: any = {};
    
    // Simulamos encadenamiento tipo:
    // res.status(200).json(...)
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    
    return res;
  };

  beforeEach(() => {

    // Creamos mocks simples con execute()
    getGenericUseCaseMock = { execute: vi.fn() };
    createGenericUseCaseMock = { execute: vi.fn() };
    updateGenericUseCaseMock = { execute: vi.fn() };
    getXIdGenericUseCaseMock = { execute: vi.fn() };
    getPokemonXNameUseCaseMock = { execute: vi.fn() };

    // Inyectamos dependencias (Inversión de Dependencias)
    controller = new GenericController(
      getGenericUseCaseMock,
      createGenericUseCaseMock,
      updateGenericUseCaseMock,
      getXIdGenericUseCaseMock,
      getPokemonXNameUseCaseMock
    );
  });

  // =====================================================
  // GET GENERIC
  // =====================================================

  it("should return generic data", async () => {

    // ============================
    // 🟢 AAA - ARRANGE
    // ============================
    const fakeResult = {
      name: "Julian",
      lastName: "Arango",
      age: 32
    };

    getGenericUseCaseMock.execute.mockResolvedValue(fakeResult);

    const req: any = {};
    const res = mockResponse();

    // ============================
    // 🟡 AAA - ACT
    // ============================
    await controller.getGeneric(req, res);

    // ============================
    // 🔵 AAA - ASSERT
    // ============================

    // Verificamos que el use case fue llamado
    expect(getGenericUseCaseMock.execute).toHaveBeenCalledTimes(1);

    // Verificamos HTTP status
    expect(res.status).toHaveBeenCalledWith(200);

    // Verificamos respuesta
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================================
  // POST GENERIC
  // =====================================================

  it("should create generic", async () => {

    // ============================
    // AAA - ARRANGE
    // ============================
    const requestBody = {
      name: "Julian",
      lastName: "Arango",
      age: 32
    };

    createGenericUseCaseMock.execute.mockResolvedValue(requestBody);

    const req: any = { body: requestBody };
    const res = mockResponse();

    // ============================
    // AAA - ACT
    // ============================
    await controller.postGeneric(req, res);

    // ============================
    // AAA - ASSERT
    // ============================

    // Se llama el use case con el body
    expect(createGenericUseCaseMock.execute)
      .toHaveBeenCalledWith(requestBody);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(requestBody);
  });

  // =====================================================
  // GET BY ID
  // =====================================================

  it("should return generic by id", async () => {

    // ============================
    // AAA - ARRANGE
    // ============================
    const fakeResult = {
      name: "Julian",
      lastName: "Arango",
      age: 32
    };

    getXIdGenericUseCaseMock.execute.mockResolvedValue(fakeResult);

    const req: any = { params: { id: "123" } };
    const res = mockResponse();

    // ============================
    // AAA - ACT
    // ============================
    await controller.getXIdGeneric(req, res);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(getXIdGenericUseCaseMock.execute)
      .toHaveBeenCalledWith("123");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================================
  // GET POKEMON
  // =====================================================

  it("should return pokemon by name", async () => {

    // ============================
    // AAA - ARRANGE
    // ============================
    const fakePokemon = {
      name: "pikachu",
      height: 4,
      weight: 60
    };

    getPokemonXNameUseCaseMock.execute
      .mockResolvedValue(fakePokemon);

    const req: any = { params: { name: "pikachu" } };
    const res = mockResponse();

    // ============================
    // AAA - ACT
    // ============================
    await controller.getPokemonXName(req, res);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(getPokemonXNameUseCaseMock.execute)
      .toHaveBeenCalledWith("pikachu");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakePokemon);
  });

  // =====================================================
  // PATCH GENERIC
  // =====================================================

  it("should update generic", async () => {

    // ============================
    // AAA - ARRANGE
    // ============================
    const requestBody = {
      name: "Julian",
      lastName: "Arango",
      age: 32
    };

    const fakeUpdateResult = {
      id: "123",
      name: "Julian",
      lastName: "Arango",
      age: 32
    };

    updateGenericUseCaseMock.execute
      .mockResolvedValue(fakeUpdateResult);

    const req: any = {
      body: requestBody,
      params: { id: "123" }
    };

    const res = mockResponse();

    // ============================
    // AAA - ACT
    // ============================
    await controller.patchGeneric(req, res);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(updateGenericUseCaseMock.execute)
      .toHaveBeenCalledWith(requestBody, "123");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "PATCH request received",
      result: fakeUpdateResult
    });
  });

});