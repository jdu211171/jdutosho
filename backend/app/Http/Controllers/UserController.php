<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\StudentHistoryResource;
use App\Http\Resources\UserListResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $role = $request->input('role');

        $users = User::when($search !== null, function ($query) use ($search) {
            $query->where('loginID', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%");
        })->when($role !== null, function ($query) use ($role) {
            $query->where('role', $role);
        })->paginate(10);

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'loginID' => $validated['loginID'],
            'name' => $validated['name'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'],
        ]);

        return new UserResource($user);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $validated = $request->validated();

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $updateData = [
            'loginID' => $validated['loginID'],
            'name' => $validated['name'],
            'role' => $validated['role'],
        ];

        // Only add password to updateData if it exists in validated data
        if (isset($validated['password'])) {
            $updateData['password'] = bcrypt($validated['password']);
        }

        $user->update($updateData);

        return new UserResource($user);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->tokens()->delete();

        $user->delete();

        return response()->json(['message' => 'User deleted'], 200);
    }

    public function studentList(Request $request)
    {
        $search = $request->input('search');

        $users = User::where(['role' => 'student'])->when($search !== null, function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('loginID', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        })->get();

        return UserListResource::collection($users);
    }

    public function studentShow($id)
    {
        $student = User::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }
        if ($student->role !== 'student') {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $student->load(['rentBooks' => function ($query) {
            $query->selectRaw('*, DATEDIFF(CURDATE(), given_date) as passed_days')
                ->orderByRaw('return_date IS NOT NULL')
                ->orderBy('passed_days', 'desc')
                ->orderBy('given_date', 'desc')
            ;
        }]);

        return new StudentHistoryResource($student);
    }


}
